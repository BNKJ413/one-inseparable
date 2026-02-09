import { PrismaClient, BattleType } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function readJson(file: string) {
  const p = path.join(process.cwd(), "prisma", "seed_data", file);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function main() {
  const scriptures = readJson("scriptures.json");
  const actions = readJson("actionIdeas.json");
  const stickers = readJson("stickers.json");

  // Upsert scriptures
  for (const s of scriptures) {
    await prisma.scripture.upsert({
      where: { id: s.id ?? "__no_id__" },
      create: {
        reference: s.reference,
        category: s.category,
        tags: JSON.stringify(s.tags ?? []),
        marriageMeaning: s.marriageMeaning,
        prayerPrompt: s.prayerPrompt ?? null,
        actionPrompt: s.actionPrompt,
        battleType: (s.battleType ? (s.battleType as BattleType) : null),
        intensity: s.intensity ?? "GENTLE",
        isFeatured: !!s.isFeatured,
      },
      update: {
        category: s.category,
        tags: JSON.stringify(s.tags ?? []),
        marriageMeaning: s.marriageMeaning,
        prayerPrompt: s.prayerPrompt ?? null,
        actionPrompt: s.actionPrompt,
        battleType: (s.battleType ? (s.battleType as BattleType) : null),
        intensity: s.intensity ?? "GENTLE",
        isFeatured: !!s.isFeatured,
      },
    });
  }

  // Insert actions if empty
  const existingActions = await prisma.actionIdea.count();
  if (existingActions === 0) {
    await prisma.actionIdea.createMany({
      data: actions.map((a: any) => ({
        title: a.title,
        mode: a.mode,
        loveLanguage: a.loveLanguage ?? "ANY",
        timeNeededMinutes: a.timeNeededMinutes,
        intimacyLevelMin: a.intimacyLevelMin ?? "PG",
        seasonTags: JSON.stringify(a.seasonTags ?? []),
        steps: JSON.stringify(a.steps ?? []),
        messageTemplate: a.messageTemplate ?? null,
        whyItHelps: a.whyItHelps,
        pointsAwarded: a.pointsAwarded ?? 5,
      })),
    });
  }

  // Preset stickers
  const existingPresets = await prisma.stickerDefinition.count({ where: { isPreset: true } });
  if (existingPresets === 0) {
    for (const st of stickers) {
      const linked = await prisma.actionIdea.findMany({ where: { title: { in: st.linkedActionTitles ?? [] } } });
      await prisma.stickerDefinition.create({
        data: {
          name: st.name,
          emoji: st.emoji,
          meaning: st.meaning ?? null,
          isPreset: true,
          linkedActions: { connect: linked.map(a => ({ id: a.id })) },
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
