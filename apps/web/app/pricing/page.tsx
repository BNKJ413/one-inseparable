export default function Pricing() {
  return (
    <main>
      <h2>Pricing</h2>
      <div className="grid">
        <div className="card">
          <h3>Free Starter</h3>
          <ul className="small">
            <li>Couple pairing</li>
            <li>Faith Mode (default ON)</li>
            <li>1 Daily Anchor/day</li>
            <li>Limited Scripture Vault + actions</li>
          </ul>
          <a className="btn" href="/register">Start Free</a>
        </div>

        <div className="card">
          <h3>Inseparable Membership — $12/month</h3>
          <ul className="small">
            <li>Unlimited anchors + full Scripture Vault</li>
            <li>Thought redirection packs</li>
            <li>Advanced triggers + drift detection</li>
            <li>Custom stickers + rewards redemption</li>
          </ul>
          <a className="btn primary" href="/settings">Start Membership</a>
        </div>

        <div className="card">
          <h3>Support the Mission</h3>
          <p className="small">If this app is strengthening your marriage, you can help extend these tools to couples around the world.</p>
          <a className="btn" href="/support">Give</a>
        </div>
      </div>
    </main>
  );
}
