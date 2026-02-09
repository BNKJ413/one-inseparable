"use client";
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function Connect() {
  const [actions, setActions] = useState<any[]>([]);
  useEffect(() => {
    // MVP: just show some actions by pulling scriptures list as placeholder? We'll call server for presets and show.
    (async () => {
      const res = await apiGet<{ list: any[] }>("/api/scripture/list");
      // display as recommended cards
      setActions(res.list.slice(0, 5));
    })();
  }, []);

  return (
    <main>
      <h2>Connect</h2>
      <p className="small">Choose what you need right now (MVP sample screen).</p>
      {actions.map(s => (
        <div className="card" key={s.id}>
          <h3 style={{margin:"6px 0"}}>{s.reference}</h3>
          <p className="small">{s.marriageMeaning}</p>
          <p><b>Action now:</b> {s.actionPrompt}</p>
        </div>
      ))}
    </main>
  );
}
