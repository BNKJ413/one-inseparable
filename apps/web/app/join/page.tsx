"use client";
import { useEffect, useState } from "react";
import { apiPost } from "../lib/api";

export default function Join() {
  const [inviteCode, setInviteCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("one_user");
    setUser(u ? JSON.parse(u) : null);
  }, []);

  async function createCouple() {
    setMsg(null);
    try {
      const r = await apiPost<{ coupleId: string; inviteCode: string }>("/api/couple/create", { userId: user?.id });
      localStorage.setItem("one_couple", JSON.stringify(r));
      setMsg(`Created. Invite code: ${r.inviteCode}`);
    } catch (e: any) { setMsg(e.message); }
  }

  async function joinCouple() {
    setMsg(null);
    try {
      const r = await apiPost<{ coupleId: string }>("/api/couple/join", { userId: user?.id, inviteCode });
      localStorage.setItem("one_couple", JSON.stringify({ coupleId: r.coupleId, inviteCode }));
      setMsg("Joined successfully.");
    } catch (e: any) { setMsg(e.message); }
  }

  return (
    <main>
      <h2>Pair / Join</h2>
      <div className="card">
        <p className="small">User: {user?.email || "Not logged in (create or login first)"}</p>
        <div className="grid grid2">
          <div className="card" style={{margin:0}}>
            <h3>Start as a Couple</h3>
            <button className="btn primary" onClick={createCouple} style={{width:"100%"}} disabled={!user}>Create couple</button>
          </div>
          <div className="card" style={{margin:0}}>
            <h3>Join Partner</h3>
            <input value={inviteCode} onChange={e=>setInviteCode(e.target.value)} className="btn" placeholder="Invite code" style={{width:"100%"}} />
            <div style={{height:10}}/>
            <button className="btn" onClick={joinCouple} style={{width:"100%"}} disabled={!user}>Join</button>
          </div>
        </div>
        <p className="small">{msg}</p>
        <div className="tabs">
          <a className="tab" href="/today">Go to Today</a>
        </div>
      </div>
    </main>
  );
}
