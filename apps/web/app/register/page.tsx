"use client";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    try {
      const r = await apiPost<{ user: any }>("/api/auth/register", { firstName, email, password });
      localStorage.setItem("one_user", JSON.stringify(r.user));
      setMsg("Account created. Go to Join/Pair.");
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <main>
      <h2>Create account</h2>
      <div className="card">
        <label className="small">First name</label><br/>
        <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="btn" style={{width:"100%", marginTop:6}} />
        <div style={{height:10}}/>
        <label className="small">Email</label><br/>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="btn" style={{width:"100%", marginTop:6}} />
        <div style={{height:10}}/>
        <label className="small">Password</label><br/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="btn" style={{width:"100%", marginTop:6}} />
        <div style={{height:12}}/>
        <button className="btn primary" onClick={submit} style={{width:"100%"}}>Create</button>
        <p className="small">{msg}</p>
        <div className="tabs">
          <a className="tab" href="/join">Pair / Join</a>
          <a className="tab" href="/login">Already have an account?</a>
        </div>
      </div>
    </main>
  );
}
