import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import Stripe from "stripe";
import { PrismaClient, Plan } from "@prisma/client";
import crypto from "node:crypto";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:3000";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const priceMonthly = process.env.STRIPE_PRICE_ID_MONTHLY || "";

const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// Stripe webhook needs raw body:
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    if (!sig || Array.isArray(sig)) return res.status(400).send("Missing signature");
    const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || "";
      const customer = (typeof session.customer === "string") ? session.customer : session.customer?.id;

      // Subscription session
      if (session.mode === "subscription" && userId) {
        await prisma.subscription.create({
          data: {
            userId,
            status: "ACTIVE",
            plan: Plan.MEMBER,
            provider: "STRIPE",
            providerRef: customer || session.id,
            startedAt: new Date(),
          },
        });
      }

      // Donation session
      if (session.metadata?.kind === "donation") {
        const amount = Number(session.amount_total || 0);
        await prisma.donation.create({
          data: {
            userId: userId || null,
            amount,
            currency: session.currency || "usd",
            type: session.mode === "subscription" ? "MONTHLY" : "ONE_TIME",
            note: session.metadata?.note || null,
          },
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// normal JSON for everything else
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Auth (simple MVP: email+password with hash) ---
const registerSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

app.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { firstName, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already used." });

  const user = await prisma.user.create({
    data: { firstName, email, passwordHash: hashPassword(password) },
    select: { id: true, firstName: true, email: true },
  });

  res.json({ user });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

app.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.passwordHash !== hashPassword(password)) return res.status(401).json({ error: "Invalid login." });

  // MVP token (NOT production-grade). Replace with NextAuth/JWT in production.
  const token = crypto.createHash("sha256").update(user.id + Date.now().toString()).digest("hex");
  res.json({ token, user: { id: user.id, firstName: user.firstName, email: user.email, coupleId: user.coupleId } });
});

// --- Couple pairing ---
app.post("/api/couple/create", async (req, res) => {
  const { userId } = req.body as { userId: string };
  if (!userId) return res.status(400).json({ error: "userId required" });

  const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const couple = await prisma.couple.create({ data: { inviteCode } });
  await prisma.user.update({ where: { id: userId }, data: { coupleId: couple.id } });

  res.json({ coupleId: couple.id, inviteCode });
});

app.post("/api/couple/join", async (req, res) => {
  const { userId, inviteCode } = req.body as { userId: string; inviteCode: string };
  if (!userId || !inviteCode) return res.status(400).json({ error: "userId + inviteCode required" });

  const couple = await prisma.couple.findUnique({ where: { inviteCode } });
  if (!couple) return res.status(404).json({ error: "Invalid invite code." });

  const memberCount = await prisma.user.count({ where: { coupleId: couple.id } });
  if (memberCount >= 2) return res.status(409).json({ error: "Couple already has 2 members." });

  await prisma.user.update({ where: { id: userId }, data: { coupleId: couple.id } });
  res.json({ coupleId: couple.id });
});

// --- Today anchor ---
app.get("/api/anchors/today", async (req, res) => {
  const coupleId = String(req.query.coupleId || "");
  if (!coupleId) return res.status(400).json({ error: "coupleId required" });

  const today = new Date().toISOString().slice(0, 10);
  let anchor = await prisma.dailyAnchor.findFirst({ where: { coupleId, date: today }, include: { scripture: true, actionIdea: true } });

  if (!anchor) {
    // generate a simple anchor: FAITH if at least one user has faithMode enabled
    const users = await prisma.user.findMany({ where: { coupleId } });
    const faithOn = users.some(u => u.faithMode);

    const scripture = faithOn ? await prisma.scripture.findFirst({ where: { isFeatured: true } }) : null;
    const actionIdea = await prisma.actionIdea.findFirst({ where: { mode: faithOn ? "FAITH" : "EMOTIONAL" } }) 
                    ?? await prisma.actionIdea.findFirst();

    if (!actionIdea) return res.status(500).json({ error: "No action ideas seeded." });

    anchor = await prisma.dailyAnchor.create({
      data: {
        coupleId,
        date: today,
        mode: faithOn ? "FAITH" : "EMOTIONAL",
        scriptureId: scripture?.id ?? null,
        principleText: faithOn ? null : "Micro-positives build long-term closeness.",
        actionIdeaId: actionIdea.id,
      },
      include: { scripture: true, actionIdea: true },
    });
  }

  res.json({ anchor });
});

app.post("/api/anchors/complete", async (req, res) => {
  const { coupleId, userId, anchorId } = req.body as { coupleId: string; userId: string; anchorId: string };
  if (!coupleId || !userId || !anchorId) return res.status(400).json({ error: "coupleId,userId,anchorId required" });

  const anchor = await prisma.dailyAnchor.update({
    where: { id: anchorId },
    data: { status: "DONE", completedAt: new Date() },
    include: { actionIdea: true },
  });

  await prisma.actionLog.create({
    data: { coupleId, userId, actionIdeaId: anchor.actionIdeaId, completionType: "DO_NOW" },
  });

  // Update streak (simple): increment if lastConnectionAt not today
  const couple = await prisma.couple.findUnique({ where: { id: coupleId } });
  const today = new Date().toISOString().slice(0,10);
  const last = couple?.lastConnectionAt ? couple.lastConnectionAt.toISOString().slice(0,10) : null;

  const newStreak = (last === today) ? (couple?.streak ?? 0) : ((couple?.streak ?? 0) + 1);

  await prisma.couple.update({
    where: { id: coupleId },
    data: { streak: newStreak, lastConnectionAt: new Date() },
  });

  await prisma.rewardLedger.create({
    data: { coupleId, userId, type: "EARN", points: anchor.actionIdea.pointsAwarded, reason: "ANCHOR_DONE" },
  });

  res.json({ ok: true, pointsAwarded: anchor.actionIdea.pointsAwarded, streak: newStreak });
});

// --- Scripture Vault ---
app.get("/api/scripture/list", async (req, res) => {
  const category = (req.query.category ? String(req.query.category) : undefined);
  const where = category ? { category } : {};
  const list = await prisma.scripture.findMany({ where, take: 50, orderBy: { reference: "asc" } });
  res.json({ list: list.map(s => ({...s, tags: JSON.parse(s.tags)})) });
});

app.get("/api/scripture/search", async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  if (!q) return res.json({ list: [] });
  const list = await prisma.scripture.findMany({ take: 50 });
  const filtered = list.filter(s => s.reference.toLowerCase().includes(q) || s.marriageMeaning.toLowerCase().includes(q) || s.tags.toLowerCase().includes(q));
  res.json({ list: filtered.map(s => ({...s, tags: JSON.parse(s.tags)})) });
});

app.post("/api/scripture/save", async (req, res) => {
  const { userId, scriptureId, note } = req.body as { userId: string; scriptureId: string; note?: string };
  if (!userId || !scriptureId) return res.status(400).json({ error: "userId + scriptureId required" });
  const saved = await prisma.savedScripture.create({ data: { userId, scriptureId, note: note ?? null } });
  res.json({ saved });
});

// --- Stickers ---
app.get("/api/stickers/presets", async (_req, res) => {
  const list = await prisma.stickerDefinition.findMany({ where: { isPreset: true }, include: { linkedActions: true } });
  res.json({ list });
});

app.post("/api/stickers/send", async (req, res) => {
  const { coupleId, fromUserId, toUserId, stickerId, note } = req.body as any;
  if (!coupleId || !fromUserId || !toUserId || !stickerId) return res.status(400).json({ error: "missing fields" });
  const msg = await prisma.stickerMessage.create({ data: { coupleId, fromUserId, toUserId, stickerId, note: note ?? null } });
  res.json({ msg });
});

// --- Billing: Stripe Checkout ---
app.post("/api/billing/create-checkout-session", async (req, res) => {
  const { userId, email } = req.body as { userId: string; email: string };
  if (!stripeSecret || !priceMonthly) return res.status(500).json({ error: "Stripe not configured." });
  if (!userId) return res.status(400).json({ error: "userId required" });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: userId,
    customer_email: email,
    line_items: [{ price: priceMonthly, quantity: 1 }],
    success_url: `${WEB_BASE_URL}/settings?billing=success`,
    cancel_url: `${WEB_BASE_URL}/settings?billing=cancel`,
    // Let Stripe automatically present eligible payment methods (cards + wallets + local methods when enabled).
    automatic_tax: { enabled: false },
    payment_method_collection: "if_required",
    // NOTE: Checkout uses automatic payment methods by default when you don't set payment_method_types.
  });

  res.json({ url: session.url });
});

app.post("/api/billing/create-donation-session", async (req, res) => {
  const { userId, email, amountCents } = req.body as { userId?: string; email?: string; amountCents: number };
  if (!stripeSecret) return res.status(500).json({ error: "Stripe not configured." });
  const amount = Math.max(100, Number(amountCents || 0)); // >= $1.00

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: userId || undefined,
    customer_email: email,
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: "Support the Mission — One-time Gift" },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    metadata: { kind: "donation" },
    success_url: `${WEB_BASE_URL}/support?giving=success`,
    cancel_url: `${WEB_BASE_URL}/support?giving=cancel`,
  });

  res.json({ url: session.url });
});

app.listen(PORT, () => {
  console.log(`@one/server listening on http://localhost:${PORT}`);
});
