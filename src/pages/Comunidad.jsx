import { PageHeader, Kpi } from '../components/ui';
import { communityPrices } from '../data/inventory';

export default function Comunidad() {
  const totalSavings = communityPrices.filter(p => p.diff < 0).reduce((s, p) => s + Math.abs(p.diff), 0);
  const worstItem = communityPrices.sort((a, b) => a.diff - b.diff)[0];

  return (
    <div className="view-enter">
      <PageHeader title="Precios de" accent="referencia." meta1="87 COMERCIOS EN CASILDA" meta2="DATOS ÚLTIMOS 7 DÍAS" />

      <div className="kpi-row">
        <Kpi label="Comercios en tu zona" value="87" delta="▲ 12 nuevos esta semana" deltaType="up" />
        <Kpi label="Podés ahorrar" value={`$${(totalSavings * 72).toLocaleString('es-AR')}`} delta="por mes ajustando proveedores" deltaType="up" />
        <Kpi label="Productos más caros" value={communityPrices.filter(p => p.diff < 0).length} color="var(--red)" delta="vs zona" deltaType="down" />
        <Kpi label="Productos más baratos" value={communityPrices.filter(p => p.diff > 0).length} color="var(--green)" delta="Buen precio" deltaType="up" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-tag navy">FUNCIÓN 04 · COMUNIDAD ANÓNIMA</div>
        <div className="card-title">Cuánto pagás vs el barrio</div>
        <div className="card-sub">
          Marca <span style={{ fontWeight: 700, color: 'var(--navy)' }}>■ azul</span> = promedio zona · Marca <span style={{ fontWeight: 700, color: 'var(--olive)' }}>■ oliva</span> = vos
        </div>
        {communityPrices.map(p => {
          const maxPrice = Math.max(p.yourPrice, p.avgPrice) * 1.1;
          const yourPct = (p.yourPrice / maxPrice) * 80 + 10;
          const avgPct = (p.avgPrice / maxPrice) * 80 + 10;
          const cheaper = p.diff > 0;
          return (
            <div key={p.id} className="comm-bar">
              <div className="comm-prod">
                <div className="name">{p.name}</div>
                <div className="you">Vos: ${p.yourPrice.toLocaleString('es-AR')}</div>
              </div>
              <div className="comm-graph">
                <div className="avg-line" style={{ left: `${avgPct}%` }}>
                  <span className="avg-label">PROM ${p.avgPrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="you-line" style={{ left: `${yourPct}%` }}>
                  <span className="you-label">VOS</span>
                </div>
              </div>
              <div className={`comm-save ${cheaper ? 'good' : 'bad'}`}>
                {cheaper ? '+' : ''}{p.diff > 0 ? p.diff : p.diff}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div className="card">
        <div className="card-title">Negociá con tu proveedor</div>
        <div className="card-sub">Insight automático generado con datos de tu zona</div>
        <div style={{ background: 'var(--bg-soft)', padding: 20, borderRadius: 12, borderLeft: '4px solid var(--olive)', fontSize: 15, lineHeight: 1.6, marginBottom: 18, fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          "Otros 23 comercios en Casilda están comprando el <strong style={{ fontStyle: 'normal', color: 'var(--ink)' }}>{worstItem?.name}</strong> a ${worstItem?.avgPrice?.toLocaleString('es-AR')}. Vos pagás ${worstItem?.yourPrice?.toLocaleString('es-AR')}. Pedile descuento a tu proveedor — <strong style={{ fontStyle: 'normal', color: 'var(--olive)' }}>ahorrarías ${Math.abs(worstItem?.diff || 0) * 72} al mes</strong>."
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary">Mandar mensaje al proveedor</button>
          <button className="btn-ghost">Ver alternativas</button>
        </div>
      </div>
    </div>
  );
}
