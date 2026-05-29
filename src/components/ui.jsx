import { useApp } from '../context/AppContext';

export function Toast() {
  const { toast } = useApp();
  return <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>;
}

export function PageHeader({ title, accent, sub, meta1, meta2 }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">
          {title}
          {accent && <> <em>{accent}</em></>}
        </h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      <div className="page-meta">
        <div className="now">{meta1}</div>
        <div>{meta2}</div>
      </div>
    </div>
  );
}

export function Kpi({ label, value, unit, delta, deltaType, spark, color }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={color ? { color } : undefined}>
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {delta && <div className={'kpi-delta ' + (deltaType || '')}>{delta}</div>}
      {spark && (
        <svg className="kpi-spark" viewBox="0 0 90 40" preserveAspectRatio="none">
          <polyline fill="none" stroke={spark.color} strokeWidth="2" points={spark.points} />
        </svg>
      )}
    </div>
  );
}

export function Ticker() {
  const items = (
    <>
      <em>USDC/ARS</em> <span>1.247,80 ▲</span>
      <em>VLA TOKEN</em> <span>$0,148 ▲ 2,4%</span>
      <em>BASE GAS</em> <span>0,0001 USDC</span>
      <em>COLATERAL POOL</em> <span>$2,4M ▲</span>
      <em>COMERCIOS RED VÍALIBRE</em> <span>4.812 ▲</span>
      <em>BLOQUE ACTUAL</em> <span>#847.221</span>
    </>
  );
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items}
        {items}
      </div>
    </div>
  );
}

export function SemaforoItem({ status, name, meta, marginPct, marginWidth, color }) {
  return (
    <div className="semaforo-item">
      <span className={'light ' + status}></span>
      <div>
        <div className="prod-name">{name}</div>
        <div className="prod-meta">{meta}</div>
      </div>
      <div className="margin-bar" style={{ '--w': `${marginWidth}%`, '--c': color }}></div>
      <div className="margin-pct" style={{ color }}>{marginPct}</div>
    </div>
  );
}

/**
 * Gauge medidor estilo "velocímetro de ganancia"
 * value: 0..100 (0 = todo rojo, 50 = amarillo, 100 = todo verde)
 */
export function Gauge({ value = 65 }) {
  // El semicírculo va de -90deg (izq) a +90deg (der). value 0..100 mapea a -90..+90.
  const angle = (value / 100) * 180 - 90;

  // Arco semicircular: cx=120, cy=120, r=100
  const cx = 120, cy = 120, r = 100;
  // tres tramos: 0-33 rojo, 33-66 amarillo, 66-100 verde (de izq a der: rojo, amarillo, verde)
  const arcPath = (startPct, endPct) => {
    const startAngle = (startPct / 100) * 180 - 180; // grados (180 = izquierda, 0 = derecha)
    const endAngle = (endPct / 100) * 180 - 180;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <div className="gauge-wrap">
      <div className="gauge">
        <svg viewBox="0 0 240 140">
          {/* Verde (izquierda) */}
          <path d={arcPath(0, 33)} fill="none" stroke="var(--green)" strokeWidth="20" strokeLinecap="butt" />
          {/* Amarillo (centro) */}
          <path d={arcPath(33, 66)} fill="none" stroke="var(--yellow)" strokeWidth="20" />
          {/* Rojo (derecha) */}
          <path d={arcPath(66, 100)} fill="none" stroke="var(--red)" strokeWidth="20" strokeLinecap="butt" />
        </svg>
        <div className="gauge-needle" style={{ '--angle': `${angle}deg` }}></div>
      </div>
    </div>
  );
}

export function GaugeLabels({ items }) {
  return (
    <div className="gauge-labels">
      {items.map((it, i) => (
        <div key={i} className="gauge-label">
          <div className={`lbl-dot ${it.dot}`}></div>
          <div className="lbl-name">{it.name}</div>
          <div className="lbl-desc">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
