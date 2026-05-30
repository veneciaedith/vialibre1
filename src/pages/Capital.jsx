import { useState } from 'react';
import { PageHeader, Kpi } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useArkiv } from '../hooks/useArkiv';
import { onChainTxs, tokenEarnings } from '../data/inventory';
import { ArrowRight, ExternalLink, RefreshCw, Wifi, WifiOff, Database } from 'lucide-react';

// Indicador de conexión on-chain
function ChainStatus({ status, loading, error, onRefresh }) {
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--bg-soft)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'var(--muted)' }}>
      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
      Conectando a Braga Chain…
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  const connected = status?.ok && !status?.mock;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', borderRadius: 10, marginBottom: 20,
      background: connected ? 'var(--green-soft)' : error ? '#fdecea' : 'var(--yellow-soft)',
      border: `1px solid ${connected ? 'var(--green)' : error ? 'var(--red)' : 'var(--yellow)'}22`,
      fontSize: 13,
    }}>
      {connected
        ? <Wifi size={16} color="var(--green)" />
        : <WifiOff size={16} color={error ? 'var(--red)' : 'var(--yellow)'} />}
      <span style={{ flex: 1, color: 'var(--ink-soft)' }}>
        {connected
          ? <>✅ Conectado · <strong style={{ color: 'var(--ink)' }}>{status.chainName}</strong> · Bloque <strong>#{status.blockNumber}</strong> · Wallet: <code style={{ fontSize: 11 }}>{status.address?.slice(0, 6)}…{status.address?.slice(-4)}</code></>
          : status?.mock
          ? <>⚠️ Modo demo — Configurá <code>PRIVATE_KEY</code> en Vercel para activar blockchain real</>
          : <>❌ {error}</>
        }
      </span>
      <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
        <RefreshCw size={14} />
      </button>
    </div>
  );
}

export default function Capital() {
  const { showToast, inventory } = useApp();
  const { status, loading, error, lastTx, syncing, fetchStatus, registerStock, syncProducts } = useArkiv();
  const [registering, setRegistering] = useState(false);

  const totalCollateral = Math.round(inventory.reduce((s, p) => s + p.cost * p.stock, 0) / 1250);
  const ltvValue = Math.round(totalCollateral * 0.60);

  const handleRegisterStock = async () => {
    setRegistering(true);
    // Sincroniza todo el inventario como entidades Arkiv (batch de entidades "product")
    const result = await syncProducts(inventory);
    setRegistering(false);
    if (result?.ok) {
      showToast(`✅ ${result.synced} productos sincronizados on-chain · TX: ${result.txHash?.slice(0, 10)}…`);
    } else {
      showToast('⚠️ Error al sincronizar. Verificá PRIVATE_KEY en Vercel.');
    }
  };

  const handleRequestCredit = () => {
    showToast('Solicitud enviada al pool DeFi. Aprobación en ~30 segundos.');
  };

  return (
    <div className="view-enter">
      <PageHeader title="Mi negocio" accent="Web3 & Reportes." meta1="RWA · BASE NETWORK · L2" meta2="STABLECOIN USDC" />

      {/* Estado de conexión on-chain */}
      <ChainStatus status={status} loading={loading} error={error} onRefresh={fetchStatus} />

      <div className="kpi-row">
        <Kpi label="Inventario tokenizado" value={`$${(totalCollateral * 1.65).toFixed(0)} USD`} delta="Aval DeFi verificado" deltaType="up" />
        <Kpi label="Microcrédito disponible" value={`$${ltvValue} USDC`} delta="Disponible ahora" deltaType="up" />
        <Kpi label="Balance wallet" value={status?.mock ? '···' : `${parseFloat(status?.balance || 0).toFixed(4)}`} unit=" GLM" delta={status?.mock ? 'Esperando conexión' : 'Braga testnet'} deltaType={status?.ok ? 'up' : ''} />
        <Kpi label="Bloque actual" value={status?.blockNumber || '···'} delta={status?.chainName || 'Braga Chain'} />
      </div>

      <div className="web3-grid">
        {/* Colateral */}
        <div className="card collateral">
          <div className="collateral-inner">
            <div className="col-label">GANANCIA BRUTA SEMANAL · CAPITAL ON-CHAIN</div>
            <div className="col-value">{ltvValue.toLocaleString()}<span className="unit">USDC</span></div>
            <div className="col-desc">Tu stock físico verificado en cada escaneo actúa como colateral. Sin banco. Sin papeles. Sin contador.</div>

            {/* Mini bar chart */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80, marginBottom: 20 }}>
              {[40, 60, 70, 80, 65, 90, 75].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? 'var(--olive-soft)' : 'rgba(255,255,255,.25)', borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontSize: 10, fontFamily: 'JetBrains Mono,monospace', opacity: .55 }}>
              {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(m => <span key={m} style={{ flex: 1, textAlign: 'center' }}>{m}</span>)}
            </div>

            <div className="col-stats">
              <div className="col-stat"><div className="l">Valor stock</div><div className="v">${(totalCollateral * 1.65).toFixed(0)} USD</div></div>
              <div className="col-stat"><div className="l">LTV ratio</div><div className="v">60%</div></div>
              <div className="col-stat"><div className="l">Tasa anual</div><div className="v">4,2%</div></div>
              <div className="col-stat"><div className="l">Bloque</div><div className="v">#{status?.blockNumber || '···'}</div></div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="col-cta" onClick={handleRequestCredit}>
                SOLICITAR CRÉDITO <ArrowRight size={16} />
              </button>
              <button
                className="col-cta"
                style={{ background: (registering || syncing) ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.12)' }}
                onClick={handleRegisterStock}
                disabled={registering || syncing}
              >
                {(registering || syncing) ? (
                  <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sincronizando entidades…</>
                ) : (
                  <><Database size={14} /> SINCRONIZAR {inventory.length} SKU ON-CHAIN</>
                )}
              </button>
            </div>

            {/* Última operación on-chain */}
            {lastTx && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,.06)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono,monospace' }}>
                <div style={{ color: 'var(--olive-soft)', marginBottom: 4 }}>
                  ✓ {lastTx.action === 'syncProducts' ? `${lastTx.synced} ENTIDADES ARKIV CREADAS` : 'ÚLTIMA TRANSACCIÓN'}
                </div>
                <div style={{ opacity: .8 }}>TX: {(lastTx.txHash || lastTx.hash)?.slice(0, 20)}…</div>
                {lastTx.explorerUrl && (
                  <a href={lastTx.explorerUrl} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--olive-soft)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    Ver en explorer <ExternalLink size={12} />
                  </a>
                )}
                {lastTx.action === 'syncProducts' && status?.explorer && lastTx.txHash && (
                  <a href={`${status.explorer}/tx/${lastTx.txHash}`} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--olive-soft)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    Ver en Braga Explorer <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
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
          {/* Wallet address si está conectado */}
          {status?.address && !status?.mock && (
            <div style={{ marginTop: 14, padding: 10, background: 'rgba(255,255,255,.08)', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono,monospace', wordBreak: 'break-all', opacity: .7 }}>
              WALLET: {status.address}
            </div>
          )}
          <button className="btn-primary"
            style={{ marginTop: 18, background: 'rgba(255,255,255,.15)', width: '100%', border: '1px solid rgba(255,255,255,.2)', borderRadius: 12 }}
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
          <div className="card-sub">
            {status?.explorer
              ? <a href={status.explorer} target="_blank" rel="noreferrer" style={{ color: 'var(--olive)', display: 'flex', alignItems: 'center', gap: 4 }}>Ver en Braga Explorer <ExternalLink size={12} /></a>
              : 'Verificables en Basescan'}
          </div>
          {onChainTxs.map((tx, i) => (
            <div key={i} className="token-row" style={{ borderColor: 'var(--border-soft)' }}>
              <span style={{ color: 'var(--ink)', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.type}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  {tx.hash} · {tx.date}
                </div>
              </span>
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, color: tx.amount > 0 ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
