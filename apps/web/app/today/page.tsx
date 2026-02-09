"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

export default function Today() {
  const [coupleId, setCoupleId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [anchor, setAnchor] = useState<any>(null);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const c = localStorage.getItem("one_couple");
    const u = localStorage.getItem("one_user");
    const couple = c ? JSON.parse(c) : null;
    const user = u ? JSON.parse(u) : null;
    setCoupleId(couple?.coupleId || "");
    setUserId(user?.id || "");
  }, []);

  useEffect(() => {
    async function load() {
      if (!coupleId) return;
      const r = await apiGet<{ anchor: any }>(`/api/anchors/today?coupleId=${encodeURIComponent(coupleId)}`);
      setAnchor(r.anchor);
    }
    load().catch(e=>setMsg(String(e)));
  }, [coupleId]);

  async function complete() {
    setMsg("");
    try {
      const r = await apiPost<{ ok:boolean; pointsAwarded:number; streak:number }>(
        "/api/anchors/complete",
        { coupleId, userId, anchorId: anchor.id }
      );
      setMsg(`Completed ✅  +${r.pointsAwarded} points | streak ${r.streak}`);
      const refreshed = await apiGet<{ anchor: any }>(`/api/anchors/today?coupleId=${encodeURIComponent(coupleId)}`);
      setAnchor(refreshed.anchor);
    } catch (e:any) {
      setMsg(e.message);
    }
  }

  return (
    <main>
      <h2>Today</h2>
      {!coupleId ? (
        <div className="card">
          <p className="small">You’re not paired yet.</p>
          <a className="btn primary" href="/join">Pair / Join</a>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="small">Today’s Anchor</div>
            {anchor?.scripture ? (
              <>
                <h3 style={{margin:"8px 0"}}>{anchor.scripture.reference}</h3>
                <p className="small">{anchor.scripture.marriageMeaning}</p>
                <p><b>Do this:</b> {anchor.actionIdea.title}</p>
              </>
            ) : (
              <>
                <h3 style={{margin:"8px 0"}}>{anchor?.principleText || "Today"}</h3>
                <p><b>Do this:</b> {anchor?.actionIdea?.title}</p>
              </>
            )}
            <div className="tabs">
              <button className="btn primary" onClick={complete} disabled={!userId || anchor?.status === "DONE"}>
                {anchor?.status === "DONE" ? "Completed ✅" : "Do it now"}
              </button>
              <a className="btn" href="/connect">Connect</a>
              <a className="btn" href="/scripture">Scripture Vault</a>
            </div>
            <p className="small">{msg}</p>
          </div>

          <div className="card">
            <div className="small">Quick actions</div>
            <div className="tabs">
              <a className="tab" href="/tension">We had tension today</a>
              <a className="tab" href="/mind">I’m struggling in my mind</a>
              <a className="tab" href="/settings">Settings</a>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
