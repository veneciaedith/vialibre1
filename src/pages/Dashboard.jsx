import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Kpi, SemaforoItem, Gauge, GaugeLabels } from '../components/ui';
import ScannerCard from '../components/ScannerCard';
import VoiceCard from '../components/VoiceCard';
import { Mic, ScanLine } from 'lucide-react';

const colorByStatus = { red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)' };

export default function Dashboard() {
  const { inventory, setScannerOpen } = useApp();

  const kpis = useMemo(() => {
    const avgMargin = inventory.reduce((s, p) => s + p.margin, 0) / inventory.length;
    const critical = inventory.filter(p => p.stock < p.optimal * 0.3).length;
    const gaugeVal = Math.min(100, Math.max(0, (avgMargin / 45) * 100));
    return { avgMargin, critical, gaugeVal, skus: inventory.length };
  }, [inventory]);

  const topProds = useMemo(() => {
    const reds = inventory.filter(p => p.status === 'red').slice(0, 1);
    const yellows = inventory.filter(p => p.status === 'yellow').slice(0, 1);
    const greens = inventory.filter(p => p.status === 'green').sort((a, b) => b.margin - a.margin).slice(0, 2);
    return [...reds, ...yellows, ...greens];
  }, [inventory]);

  const featuredChips = useMemo(() =>
    inventory.filter(p => p.status === 'green').sort((a, b) => b.margin - a.margin).slice(0, 3),
    [inventory]);

  return (
    <div className="view-enter">
      <PageHeader
        title="Tu negocio"
        accent="al día."
        sub="Casilda · Jueves 29 de Mayo, 2026"
        meta1="JUEVES 29 / MAY / 2026"
        meta2="13:47 · CASILDA, SF"
      />

      {/* KPIs */}
      <div className="kpi-row">
        <Kpi label="Ventas hoy" value="$84.320"
          delta="▲ 12,4% vs ayer" deltaType="up"
          spark={{ color: 'var(--green)', points: '0,32 15,28 30,22 45,24 60,14 75,18 90,6' }} />
        <Kpi label="Margen promedio" value={`${kpis.avgMargin.toFixed(1)}%`}
          delta="▼ 1,8 pts inflación" deltaType="down"
          spark={{ color: 'var(--red)', points: '0,8 15,12 30,10 45,18 60,16 75,22 90,28' }} />
        <Kpi label="SKU activos" value={kpis.skus}
          delta="▲ 7 nuevos esta semana" deltaType="up" />
        <Kpi label="Colateral on-chain" value="$3.420" unit=" USDC"
          delta="▲ verificado · #847.221" deltaType="up" />
      </div>

      {/* Semáforo gauge + chips */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-tag terra">SEMÁFORO DE GANANCIA</div>
          <div className="card-title">¿Cómo vas hoy?</div>
          <div className="card-sub">Margen ponderado de {kpis.skus} productos</div>
          <Gauge value={kpis.gaugeVal} />
          <GaugeLabels items={[
            { dot: 'green', name: 'Producto Estrella', desc: '¡Pide más!' },
            { dot: 'yellow', name: 'Márgenes Apretados', desc: 'Revisa Gastos' },
            { dot: 'red', name: 'Vendés con Pérdida', desc: 'Revisa Proveedor' },
          ]} />
          <div className="prod-chips" style={{ marginTop: 20 }}>
            {featuredChips.map(p => (
              <div key={p.id} className="prod-chip">
                <span className="chip-dot green"></span>
                <div className="chip-name">{p.name.split(' ').slice(0, 2).join(' ')}</div>
                <div className="chip-meta">+{p.margin}%</div>
              </div>
            ))}
          </div>
          <button className="scan-btn" style={{ marginTop: 18, width: '100%', justifyContent: 'center', borderRadius: 12, background: 'var(--navy)' }}
            onClick={() => setScannerOpen(true)}>
            <ScanLine size={18} /> FAB · ESCANEAR
          </button>
        </div>

        {/* Top 4 semaforo list */}
        <div className="card">
          <div className="card-tag navy">ALERTAS ACTIVAS</div>
          <div className="card-title">Productos en foco</div>
          <div className="card-sub">Ordenados por urgencia</div>
          {topProds.map(p => (
            <SemaforoItem
              key={p.id}
              status={p.status}
              name={p.name}
              meta={p.alert || (p.status === 'green' ? 'ESTABLE · SEGUIR IGUAL' : '')}
              marginPct={`${p.margin > 0 ? '+' : ''}${p.margin}%`}
              marginWidth={Math.min(Math.max(p.margin * 2.5, 5), 100)}
              color={colorByStatus[p.status]}
            />
          ))}
        </div>
      </div>

      {/* Scanner + Voice */}
      <div className="grid-2">
        <ScannerCard />
        <VoiceCard />
      </div>

      {/* WhatsApp Assistant preview */}
      <div style={{ marginTop: 20 }}>
        <div className="card assistant" style={{ padding: 0 }}>
          <div className="wpp-head">
            <div className="wpp-avatar">VL</div>
            <div>
              <div className="wpp-name">Asistente VíaLibre</div>
              <div className="wpp-status">(8:00 AM)</div>
            </div>
          </div>
          <div className="wpp-body">
            <div className="msg" style={{ animationDelay: '0s' }}>
              ¡Hola Don Tito! Hoy es viernes, alta venta de pan. Solo te quedan <strong>10 unidades</strong>. ¿Pido al Proveedor Molinos (20 unidades)?
              <span className="time">8:00 AM</span>
            </div>
            <div className="wpp-actions">
              <button className="wpp-action" style={{ background: 'var(--navy)', color: '#fff' }}>SÍ, PEDIR Y PAGAR</button>
              <button className="wpp-action danger">CANCELAR</button>
              <button className="wpp-action">CAMBIAR CANTIDAD</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
