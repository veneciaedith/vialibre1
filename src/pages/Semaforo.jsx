import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Kpi, SemaforoItem, Gauge, GaugeLabels } from '../components/ui';

const colorByStatus = { red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)' };

export default function Semaforo() {
  const { inventory } = useApp();

  const stats = useMemo(() => {
    const red = inventory.filter(p => p.status === 'red').length;
    const yellow = inventory.filter(p => p.status === 'yellow').length;
    const green = inventory.filter(p => p.status === 'green').length;
    const avgMargin = inventory.reduce((s, p) => s + p.margin, 0) / inventory.length;
    const gaugeVal = Math.min(100, Math.max(0, (avgMargin / 40) * 100));
    const saved = 28400;
    return { red, yellow, green, gaugeVal, saved };
  }, [inventory]);

  const sorted = useMemo(() =>
    [...inventory].sort((a, b) => {
      const order = { red: 0, yellow: 1, green: 2 };
      return order[a.status] - order[b.status];
    }), [inventory]);

  return (
    <div className="view-enter">
      <PageHeader title="Semáforo de" accent="ganancia." meta1="ACTUALIZADO HACE 4 MIN" meta2={`${inventory.length} SKU MONITOREADOS`} />

      <div className="kpi-row">
        <Kpi label="En rojo" value={stats.red} color="var(--red)" delta="▲ 3 nuevos hoy" deltaType="down" />
        <Kpi label="En amarillo" value={stats.yellow} color="var(--yellow)" delta="Revisar costos" />
        <Kpi label="En verde" value={stats.green} color="var(--green)" delta="87% del stock OK" deltaType="up" />
        <Kpi label="Ganancia salvada" value="$28.4K" delta="▲ Este mes" deltaType="up" />
      </div>

      <div className="grid-2">
        {/* Gauge grande */}
        <div className="card">
          <div className="card-tag terra">SALUD GENERAL DEL NEGOCIO</div>
          <div className="card-title">¿Cómo estás ganando hoy?</div>
          <div className="card-sub">Margen ponderado de todos los productos</div>
          <Gauge value={stats.gaugeVal} />
          <GaugeLabels items={[
            { dot: 'green', name: 'Producto Estrella', desc: '¡Pide más!' },
            { dot: 'yellow', name: 'Márgenes Apretados', desc: 'Revisa Gastos' },
            { dot: 'red', name: 'Vendés con Pérdida', desc: 'Revisa Proveedor' },
          ]} />
        </div>

        {/* Resumen por estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--red)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--red)' }}>🔴 Acción inmediata</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>{stats.red} productos perdiendo dinero</div>
            {inventory.filter(p => p.status === 'red').map(p => (
              <SemaforoItem key={p.id} status="red" name={p.name} meta={p.alert || 'REVISAR PROVEEDOR'}
                marginPct={`${p.margin > 0 ? '+' : ''}${p.margin}%`}
                marginWidth={Math.max(5, Math.min(p.margin * 2, 100))} color="var(--red)" />
            ))}
          </div>
          <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--yellow)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--yellow)' }}>🟡 Atención</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>{stats.yellow} con margen bajo</div>
            {inventory.filter(p => p.status === 'yellow').slice(0, 2).map(p => (
              <SemaforoItem key={p.id} status="yellow" name={p.name} meta={p.alert || 'MARGEN BAJO'}
                marginPct={`+${p.margin}%`}
                marginWidth={Math.max(5, p.margin * 2)} color="var(--yellow)" />
            ))}
          </div>
        </div>
      </div>

      {/* Lista completa */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">Todos los productos</div>
        <div className="card-sub">Ordenados por urgencia</div>
        {sorted.map(p => (
          <SemaforoItem key={p.id} status={p.status} name={p.name}
            meta={p.alert || (p.status === 'green' ? 'PRODUCTO ESTABLE' : '')}
            marginPct={`${p.margin > 0 ? '+' : ''}${p.margin}%`}
            marginWidth={Math.min(Math.max(p.margin * 2.3, 5), 100)}
            color={colorByStatus[p.status]} />
        ))}
      </div>
    </div>
  );
}
