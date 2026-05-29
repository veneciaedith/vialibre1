import { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { defiOffers } from '../data/inventory';

export default function Score() {
  const { showToast } = useApp();
  const [animated, setAnimated] = useState(false);
  const score = 782;
  const maxScore = 900;
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (score / maxScore) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="view-enter">
      <PageHeader title="Score" accent="on-chain." meta1="REPUTACIÓN WEB3" meta2="SIN BANCO · SIN CONTADOR" />

      <div className="grid-2">
        <div className="card score-card">
          <div className="score-head">
            <div className="card-title">Tu reputación crediticia</div>
            <div className="card-sub">Generada por tu operación diaria, verificada en blockchain</div>
          </div>
          <div className="score-ring-wrap">
            <div className="score-ring">
              <svg viewBox="0 0 200 200">
                <circle className="track" cx="100" cy="100" r="88" />
                <circle className="progress" cx="100" cy="100" r="88"
                  strokeDasharray={circumference}
                  strokeDashoffset={animated ? offset : circumference} />
              </svg>
              <div className="score-num">
                {animated ? score : 0}<small>/{maxScore}</small>
              </div>
            </div>
          </div>
          <div className="score-grade">RANGO A · APTO PARA FINANCIAMIENTO GLOBAL</div>
          <div className="score-factors">
            {[
              { label: 'Consistencia operativa (90 días)', value: '98%', color: 'var(--green)' },
              { label: 'Volumen verificado de ventas', value: 'A+', color: 'var(--green)' },
              { label: 'Márgenes positivos sostenidos', value: 'A', color: 'var(--green)' },
              { label: 'Frecuencia actualización stock', value: 'B+', color: 'var(--yellow)' },
              { label: 'Antigüedad on-chain', value: '11 meses', color: 'var(--olive)' },
            ].map(f => (
              <div key={f.label} className="score-factor">
                <span>{f.label}</span>
                <span className="v" style={{ color: f.color }}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-tag navy">OFERTAS PARA VOS</div>
          <div className="card-title">Financiamiento disponible</div>
          <div className="card-sub">Protocolos que aprobarían tu score sin papeles</div>

          {defiOffers.map((offer, i) => (
            <div key={i} className={`defi-offer ${offer.color}`}>
              <div className="defi-offer-head">
                <strong>{offer.protocol}</strong>
                <span className="tag">{offer.type}</span>
              </div>
              <div className="defi-offer-desc">
                Hasta <strong>{offer.currency === 'ARS' ? '$' : '$'}{offer.amount.toLocaleString('es-AR')} {offer.currency || 'USDC'}</strong> · Tasa {offer.rate}% anual · {offer.desc}
              </div>
              <button
                className={'btn-primary' + (offer.color === 'green' ? '' : ' ')}
                style={{
                  padding: '9px 16px',
                  fontSize: 13,
                  width: 'auto',
                  flex: 0,
                  background: offer.color === 'green' ? 'var(--navy)' : 'transparent',
                  color: offer.color === 'green' ? '#fff' : 'var(--ink)',
                  border: offer.color !== 'green' ? '1px solid var(--border)' : 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
                onClick={() => showToast(`Solicitud enviada a ${offer.protocol}`)}
              >
                {offer.color === 'green' ? 'Solicitar' : 'Ver términos'}
              </button>
            </div>
          ))}

          <div style={{ background: 'var(--bg-soft)', padding: 16, borderRadius: 10, marginTop: 8 }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--muted)', letterSpacing: '.14em', marginBottom: 8 }}>VENTAJA CLAVE</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Con tu score on-chain <strong>no necesitás balance contable</strong>, recibos de sueldo ni garantías físicas. Tu constancia operativa <em>es</em> tu historial crediticio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
