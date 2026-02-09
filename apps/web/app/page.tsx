export default function Page() {
  return (
    <main>
      <h1 style={{ marginBottom: 6 }}>One <span className="badge">Inseparable</span></h1>
      <p className="small">A warm, practical couples app with Faith Mode (optional), daily anchors, and Scripture tools.</p>
      <div className="card">
        <h3>Get started</h3>
        <div className="tabs">
          <a className="tab" href="/register">Create account</a>
          <a className="tab" href="/login">Login</a>
        </div>
      </div>
      <div className="card">
        <h3>Pricing</h3>
        <p className="small">Free Starter • Inseparable Membership $12/mo • Support the Mission (donation)</p>
        <a className="btn" href="/pricing">View pricing</a>
      </div>
    </main>
  );
}
