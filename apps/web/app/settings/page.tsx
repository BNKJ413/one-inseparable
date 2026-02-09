"use client";
import { useEffect, useState } from "react";
import { apiPost } from "../lib/api";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const u = localStorage.getItem("one_user");
    setUser(u ? JSON.parse(u) : null);
  }, []);

  async function subscribe() {
    setMsg("");
    try {
      const r = await apiPost<{ url: string }>("/api/billing/create-checkout-session", { userId: user?.id, email: user?.email });
      window.location.href = r.url;
    } catch (e:any) {
      setMsg(e.message);
    }
  }

  async function donate() {
    setMsg("");
    try {
      const r = await apiPost<{ url: string }>("/api/billing/create-donation-session", { userId: user?.id, email: user?.email, amountCents: 1200 });
      window.location.href = r.url;
    } catch (e:any) {
      setMsg(e.message);
    }
  }

  return (
    <main>
      <h2>Settings</h2>
      <div className="card">
        <div className="small">Account</div>
        <p>{user?.email || "Not logged in"}</p>
        <div className="tabs">
          <button className="btn primary" onClick={subscribe} disabled={!user}>Start Membership — $12/mo</button>
          <button className="btn" onClick={donate} disabled={!user}>Support the Mission ($12)</button>
        </div>
        <p className="small">{msg}</p>
      </div>
      <div className="card">
        <a className="btn" href="/pricing">Pricing</a>
        <a className="btn" href="/support">Donation page</a>
      </div>
    </main>
  );
}
