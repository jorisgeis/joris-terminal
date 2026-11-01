import { CONFIG, type Config } from '../content/config';

/** The facts a reviewer needs without typing anything. Empty CONFIG values hide their row. */
export function SummaryCard({ config = CONFIG }: { config?: Config }) {
  const fee = config.FEE ? config.FEE.replace(/\.$/, '') + '.' : '';
  return (
    <section className="sum" aria-labelledby="who">
      <h1 id="who">Joris Geis</h1>
      <p className="role">Full-stack engineer · React, Next.js, TypeScript, Node.js</p>
      <dl className="kv">
        <dt>looking for</dt>
        <dd>
          Full-stack internship, <span>{config.LENGTH}</span>, on-site{' '}
          <span>{config.CITIES || 'in the US'}</span>
        </dd>
        {config.START && (
          <>
            <dt>start</dt>
            <dd>{config.START}</dd>
          </>
        )}
        <dt>visa</dt>
        <dd>
          J-1 Intern. A sponsor handles the visa; you make an offer and co-sign a training plan I
          draft. No H-1B, no lottery.{' '}
          <details>
            <summary>What else hosting involves</summary>
            <ul>
              <li>I work on-site with a supervisor.</li>
              <li>Programs over 6 months have a midpoint and a final evaluation.</li>
              <li>The sponsor checks your EIN and workers’ comp, and may visit small companies.</li>
              {fee && <li data-testid="fee">{fee}</li>}
            </ul>
          </details>
        </dd>
        <dt>studying</dt>
        <dd>
          B.S. Information Systems, Hochschule Emden/Leer
          {config.GRAD && <span>{' · graduating ' + config.GRAD}</span>}
        </dd>
        <dt>based in</dt>
        <dd>Zetel, Germany (CET)</dd>
      </dl>
      <ul className="jobs" aria-label="Experience">
        <li>
          <span className="when">Sep 2026 – now</span>
          <span>
            <b>Full-Stack Developer</b>, arztkonsultation{' '}
            <span className="imp">· encrypted telehealth</span>
          </span>
        </li>
        <li>
          <span className="when">Mar – Sep 2026</span>
          <span>
            <b>Full-Stack Developer</b>, Nova Digital Group{' '}
            <span className="imp">· client websites</span>
          </span>
        </li>
        <li>
          <span className="when">Nov 2024 – Nov 2025</span>
          <span>
            <b>Software Engineering Intern</b>, Groupera{' '}
            <span className="imp">· 12 months full-time · streak system, churn −10%</span>
          </span>
        </li>
        <li>
          <span className="when">Jan – Oct 2023</span>
          <span>
            <b>Frontend Developer</b>, buildnext <span className="imp">· client websites</span>
          </span>
        </li>
      </ul>
      <div className="acts">
        <a className="primary" href="mailto:geis.joris@gmail.com">
          Email Joris
        </a>
        {config.RESUME_URL && (
          <a data-href="resume" href={config.RESUME_URL} target="_blank" rel="noopener">
            Résumé
          </a>
        )}
        {config.ARTIFACT_URL && (
          <a data-href="artifact" href={config.ARTIFACT_URL} target="_blank" rel="noopener">
            Code
          </a>
        )}
        <a href="https://linkedin.com/in/jorisgeis">LinkedIn</a>
        <a href="https://github.com/jorisgeis">GitHub</a>
      </div>
    </section>
  );
}
