import { useState } from 'react';
import { PageHeader, Kpi } from '../components/ui';
import { useApp } from '../context/AppContext';
import { onChainTxs, tokenEarnings } from '../data/inventory';
import { ArrowRight, ExternalLink } from 'lucide-react';

export default function Capital() {
  const { showToast, inventory } = useApp();
  const totalCollateral = Math.round(inventory.reduce((s, p) => s + p.cost * p.stock, 0) / 1250);
  const ltvValue = Math.round(totalCollateral * 0.60);
  const [requesting, setRequesting] = useState(false);

  const handleRequest = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      showToast('✓ Solicitud enviada. Aprobación DeFi en ~30 segundos.');
    }, 1800);
  };

  return (
    <div className="view-enter">
      <PageHeader title="Mi negocio" accent="Web3 & Reportes." meta1="RWA · BASE NETWORK · L2" meta2="STABLECOIN USDC" />

      <div className="kpi-row">
        <Kpi label="Inventario tokenizado" value={`$${(totalCollateral * 1.65).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`} delta="Aval DeFi verificado" deltaType="up" />
        <Kpi label="Microcrédito disponible" value={`$${ltvValue} USDC`} delta="Disponible ahora" deltaType="up" />
        <Kpi label="Data-to-Earn" value="150 VLA" delta="142 acumulados" deltaType="up" />
        <Kpi label="Score reputación" value="95" unit="/100" delta="Excelente · Rango A" deltaType="up" />
      </div>

      <div className="web3-grid">
        {/* Colateral */}
        <div className="card collateral">
          <div className="collateral-inner">
            <div className="col-label">GANANCIA BRUTA SEMANAL · CAPITAL ON-CHAIN</div>
            <div className="col-value">{ltvValue.toLocaleString()}<span className="unit">USDC</span></div>
            <div className="col-desc">Tu stock físico verificado en cada escaneo actúa como colateral. Sin banco. Sin papeles. Sin contador.</div>
            {/* Mini bar chart like in mockup */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80, marginBottom: 20 }}>
              {[40, 60, 70, 80, 65, 90, 75].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? 'var(--olive-soft)' : 'rgba(255,255,255,.25)', borderRadius: '4px 4px 0 0', transition: 'height .5s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontSize: 10, fontFamily: 'JetBrains Mono,monospace', opacity: .55 }}>
              {['Jan','Mon','May','Jun.','Tim.','Sat','Sat.'].map(m => <span key={m} style={{ flex: 1, textAlign: 'center' }}>{m}</span>)}
            </div>
            <div className="col-stats">
              <div className="col-stat"><div className="l">Valor stock</div><div className="v">${(totalCollateral * 1.65).toFixed(0)} USD</div></div>
              <div className="col-stat"><div className="l">LTV ratio</div><div className="v">60%</div></div>
              <div className="col-stat"><div className="l">Tasa anual</div><div className="v">4,2%</div></div>
              <div className="col-stat"><div className="l">Bloque</div><div className="v">#847.221</div></div>
            </div>
            <button className="col-cta" onClick={handleRequest} disabled={requesting}>
              {requesting ? 'Procesando...' : 'SOLICITAR CRÉDITO'}
              {!requesting && <ArrowRight size={16} />}
            </button>
            <button className="col-cta" style={{ background: 'rgba(255,255,255,.12)', marginLeft: 10 }} onClick={() => showToast('Conversión a stablecoins iniciada.')}>
              CONVERTIR A STABLECOINS
            </button>
          </div>
        </div>

        {/* Data-to-Earn */}
        <div className="card token-card">
          <div className="col-label">DATA-TO-EARN RECOMPENSAS</div>
          <div className="col-value">142<span className="unit">VLA</span></div>
          <div className="col-desc" style={{ color: 'rgba(255,255,255,.8)' }}>
            Cada escaneo de factura alimenta un dataset. Grandes marcas pagan por eso. Una fracción vuelve a vos.
          </div>
          <div style={{ marginTop: 16 }}>
            {tokenEarnings.map((e, i) => (
              <div key={i} className="token-row">
                <span className="src">{e.brand}</span>
                <span className="amt">+{e.amount} VLA</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 18, background: 'rgba(255,255,255,.15)', width: '100%', border: '1px solid rgba(255,255,255,.2)' }}
            onClick={() => showToast('Recompensas convertidas a USDC.')}>
            Convertir VLA → USDC
          </button>
        </div>
      </div>

      {/* Escrow + historial */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card escrow">
          <div className="card-tag navy">PAGOS PROGRAMABLES · ESCROW</div>
          <div className="card-title">Pedido a Bimbo</div>
          <div className="card-sub">$24.180 · Contrato 0x84f…2c9b</div>
          {[
            { label: 'Pedido autorizado por WhatsApp', sub: '05:15 AM · CONTRATO DESPLEGADO', amt: '$24.180', done: true },
            { label: 'Fondos bloqueados en escrow', sub: '05:15 AM · USDC LOCKED', amt: '$24.180', done: true },
            { label: 'Esperando entrega física', sub: 'ETA 11:00 AM · ESCANEAR REMITO', amt: '—', active: true },
            { label: 'Liberación automática al proveedor', sub: 'AL CONFIRMAR REMITO POR CÁMARA', amt: '$24.180' },
          ].map((step, i) => (
            <div key={i} className={`escrow-step ${step.done ? 'done' : step.active ? 'active' : ''}`}>
              <div className="step-dot">{step.done ? '✓' : i + 1}</div>
              <div className="step-info">
                <div className="l">{step.label}</div>
                <div className="s">{step.sub}</div>
              </div>
              <div className="step-amt">{step.amt}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-tag navy">HISTORIAL ON-CHAIN</div>
          <div className="card-title">Transacciones</div>
          <div className="card-sub">Verificables en Basescan</div>
          {onChainTxs.map((tx, i) => (
            <div key={i} className="token-row" style={{ borderColor: 'var(--border-soft)' }}>
              <span style={{ color: 'var(--ink)', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.type}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  {tx.hash} · {tx.date}
                </div>
              </span>
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: tx.amount > 0 ? 'var(--green)' : 'var(--red)' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.unit}
              </span>
              <ExternalLink size={14} style={{ color: 'var(--muted)', marginLeft: 8, cursor: 'pointer' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
