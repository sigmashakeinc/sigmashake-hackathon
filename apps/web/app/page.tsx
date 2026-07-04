import { getRuntimeStatus } from "@/lib/api";
import { statusTone } from "@/lib/view-model";

export default async function Home() {
  const status = await getRuntimeStatus();
  const tone = statusTone(status.health);

  return (
    <main className="shell">
      <section className="topbar" aria-label="Hackathon operations">
        <div>
          <p className="eyebrow">hack.sigmashake.com</p>
          <h1>SigmaShake Hackathon</h1>
        </div>
        <div className={`statusPill ${tone}`}>{status.health}</div>
      </section>

      <section className="opsGrid" aria-label="Runtime status">
        <article className="metric">
          <span>Environment</span>
          <strong>{status.environment}</strong>
        </article>
        <article className="metric">
          <span>Auth</span>
          <strong>{status.authMode}</strong>
        </article>
        <article className="metric">
          <span>Generation</span>
          <strong>{status.stateGeneration}</strong>
        </article>
        <article className="metric">
          <span>Supervisor</span>
          <strong>{status.supervisor}</strong>
        </article>
      </section>

      <section className="workbench" aria-label="Agent workbench">
        <div className="lane">
          <h2>Tracks</h2>
          <ul>
            {status.tracks.map((track) => (
              <li key={track.slug}>
                <span>{track.name}</span>
                <b>{track.openSubmissions}</b>
              </li>
            ))}
          </ul>
        </div>
        <div className="lane">
          <h2>Agents</h2>
          <ul>
            {status.agents.map((agent) => (
              <li key={agent.name}>
                <span>{agent.name}</span>
                <b>{agent.state}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
