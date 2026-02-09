"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function ScriptureVault() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("one_user");
    setUserId(u ? JSON.parse(u).id : "");
    (async () => {
      const r = await apiGet<{ list: any[] }>("/api/scripture/list");
      setList(r.list);
    })();
  }, []);

  async function search() {
    const r = await apiGet<{ list: any[] }>(`/api/scripture/search?q=${encodeURIComponent(q)}`);
    setList(r.list);
  }

  async function save(scriptureId: string) {
    setMsg("");
    try {
      await apiPost("/api/scripture/save", { userId, scriptureId });
      setMsg("Saved ✅");
    } catch (e:any) {
      setMsg(e.message);
    }
  }

  return (
    <main>
      <h2>Scripture Vault</h2>
      <div className="card">
        <input className="btn" style={{width:"100%"}} placeholder="Search: resentment, lust, peace..." value={q} onChange={e=>setQ(e.target.value)} />
        <div style={{height:10}}/>
        <button className="btn primary" onClick={search} style={{width:"100%"}}>Search</button>
        <p className="small">{msg}</p>
      </div>

      {list.map(s => (
        <div className="card" key={s.id}>
          <h3 style={{margin:"6px 0"}}>{s.reference}</h3>
          <p className="small">{s.marriageMeaning}</p>
          {s.prayerPrompt ? <p className="small"><b>Prayer:</b> {s.prayerPrompt}</p> : null}
          <p><b>Action now:</b> {s.actionPrompt}</p>
          <button className="btn" onClick={()=>save(s.id)} disabled={!userId}>Save</button>
        </div>
      ))}
    </main>
  );
}
