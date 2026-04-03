export default function KickedScreen() {
  return (
    <div className="screen-wrap" style={{ textAlign: "center" }}>
      <div className="landing-card" style={{ gap: "1.5rem" }}>
        <p style={{ fontSize: "4rem" }}>🚪</p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>You've been removed</h2>
        <p style={{ color: "var(--c-text-muted)" }}>The host removed you from the game.</p>
        <a href="/" className="btn-back">Back to Home</a>
      </div>
    </div>
  );
}
