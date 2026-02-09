"use client";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    try {
      const r = await apiPost<{ token: string; user: any }>("/api/auth/login", { email, password });
      localStorage.setItem("one_token", r.token);
      localStorage.setItem("one_user", JSON.stringify(r.user));
      setMsg("Logged in. Go to Join/Pair or Today.");
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <main>
      <h2>Login</h2>
      <div className="card">
        <label className="small">Email</label><br/>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="btn" style={{width:"100%", marginTop:6}} />
        <div style={{height:10}}/>
        <label className="small">Password</label><br/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="btn" style={{width:"100%", marginTop:6}} />
        <div style={{height:12}}/>
        <button className="btn primary" onClick={submit} style={{width:"100%"}}>Login</button>
        <p className="small">{msg}</p>
        <div className="tabs">
          <a className="tab" href="/join">Pair / Join</a>
          <a className="tab" href="/today">Today</a>
        </div>
      </div>
    </main>
  );
}
