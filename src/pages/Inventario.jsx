import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useArkiv } from '../hooks/useArkiv';
import { PageHeader, Kpi } from '../components/ui';
import { Search, Database, RefreshCw, ExternalLink, CheckCircle2, Edit3, Check, X } from 'lucide-react';

const CATS = ['Todos', 'Almacén', 'Bebidas', 'Lácteos', 'Limpieza', 'Panadería', 'Conservas', 'Hogar'];
const statusColor = { red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)' };
const EXPLORER = 'https://explorer.braga.hoodi.arkiv.network';

function SyncArkivPanel({ inventory }) {
  const { syncProducts, syncing } = useArkiv();
  const [result, setResult] = useState(null); // { ok, synced, txHash, error }

  const handleSync = async () => {
    setResult(null);
    const data = await syncProducts(inventory);
    if (data?.ok) {
      setResult({ ok: true, synced: data.synced, txHash: data.txHash });
    } else {
      setResult({ ok: false, error: 'Error al sincronizar. Verificá conexión y PRIVATE_KEY.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 10, border: 'none', cursor: syncing ? 'not-allowed' : 'pointer',
          background: syncing ? 'var(--bg-soft)' : 'var(--navy)',
          color: syncing ? 'var(--muted)' : '#fff',
          fontFamily: 'JetBrains Mono,monospace', fontSize: 12, fontWeight: 600, letterSpacing: '.06em',
          whiteSpace: 'nowrap', transition: 'opacity .2s',
        }}
      >
        {syncing
          ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> SINCRONIZANDO…</>
          : <><Database size={13} /> SINCRONIZAR EN ARKIV</>}
      </button>

      {result?.ok && (
        <div style={{
          padding: '12px 14px', borderRadius: 10,
          background: 'var(--green-soft, #edfaf1)', border: '1px solid var(--green)',
          fontSize: 12, fontFamily: 'JetBrains Mono,monospace',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--green)', fontWeight: 700 }}>
            <CheckCircle2 size={14} /> {result.synced} ENTIDADES ARKIV CREADAS
          </div>
          <div style={{ color: 'var(--ink-soft)', marginBottom: 6, fontSize: 11 }}>
            TX HASH
          </div>
          <div style={{
            padding: '6px 10px', background: 'rgba(0,0,0,.04)', borderRadius: 6,
            wordBreak: 'break-all', color: 'var(--ink)', fontSize: 11, marginBottom: 8,
          }}>
            {result.txHash}
          </div>
          <a
            href={`${EXPLORER}/tx/${result.txHash}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              color: 'var(--navy)', fontWeight: 600, fontSize: 11, textDecoration: 'none',
            }}
          >
            Ver en Braga Explorer <ExternalLink size={11} />
          </a>
        </div>
      )}

      {result?.ok === false && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: '#fdecea', border: '1px solid var(--red)',
          fontSize: 12, color: 'var(--red)', fontFamily: 'JetBrains Mono,monospace',
        }}>
          ⚠ {result.error}
        </div>
      )}
    </div>
  );
}

function EditablePrice({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  if (!editing) return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      ${value.toLocaleString('es-AR')}
      <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}>
        <Edit3 size={13} />
      </button>
    </span>
  );
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="number"
        value={val}
        onChange={e => setVal(+e.target.value)}
        style={{ width: 80, padding: '4px 8px', border: '1px solid var(--navy)', borderRadius: 6, fontFamily: 'inherit', fontSize: 13 }}
        autoFocus
      />
      <button onClick={() => { onSave(val); setEditing(false); }} style={{ background: 'var(--green)', border: 'none', borderRadius: 6, color: '#fff', padding: 4, cursor: 'pointer' }}><Check size={13} /></button>
      <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: 4, cursor: 'pointer' }}><X size={13} /></button>
    </span>
  );
}

export default function Inventario() {
  const { inventory, adjustPrice } = useApp();
  const [showSync, setShowSync] = useState(false);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todos');
  const [sort, setSort] = useState('name');

  const stats = useMemo(() => ({
    red: inventory.filter(p => p.status === 'red').length,
    yellow: inventory.filter(p => p.status === 'yellow').length,
    green: inventory.filter(p => p.status === 'green').length,
    critical: inventory.filter(p => p.stock < p.optimal * 0.3).length,
  }), [inventory]);

  const filtered = useMemo(() => {
    let list = inventory.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search);
      const matchCat = cat === 'Todos' || p.category === cat;
      return matchSearch && matchCat;
    });
    if (sort === 'margin-asc') list = [...list].sort((a, b) => a.margin - b.margin);
    if (sort === 'margin-desc') list = [...list].sort((a, b) => b.margin - a.margin);
    if (sort === 'stock') list = [...list].sort((a, b) => (a.stock / a.optimal) - (b.stock / b.optimal));
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [inventory, search, cat, sort]);

  return (
    <div className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader title="Inventario" accent="vivo." meta1={`${inventory.length} SKU · ACTUALIZADO 13:42`} meta2="SINCRONIZADO ON-CHAIN" />
        <button
          onClick={() => setShowSync(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--navy)',
            background: showSync ? 'var(--navy)' : 'transparent',
            color: showSync ? '#fff' : 'var(--navy)',
            fontFamily: 'JetBrains Mono,monospace', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '.06em', flexShrink: 0, marginTop: 8,
          }}
        >
          <Database size={13} /> ARKIV SYNC
        </button>
      </div>

      {showSync && (
        <div style={{ marginBottom: 16 }}>
          <SyncArkivPanel inventory={inventory} />
        </div>
      )}

      <div className="kpi-row">
        <Kpi label="En rojo" value={stats.red} color="var(--red)" delta="Acción urgente" deltaType="down" />
        <Kpi label="En amarillo" value={stats.yellow} color="var(--yellow)" delta="Revisar costos" />
        <Kpi label="En verde" value={stats.green} color="var(--green)" delta={`${Math.round(stats.green / inventory.length * 100)}% del stock`} deltaType="up" />
        <Kpi label="Stock crítico" value={stats.critical} color="var(--red)" delta="Reponer hoy" deltaType="down" />
      </div>

      {/* Controls */}
      <div className="inv-controls">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            className="search-input"
            style={{ paddingLeft: 38 }}
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {CATS.map(c => (
          <button key={c} className={'chip' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>{c}</button>
        ))}
        <select
          className="search-input"
          style={{ flex: 0, width: 'auto', paddingRight: 32 }}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="name">A–Z</option>
          <option value="margin-desc">Mayor margen</option>
          <option value="margin-asc">Menor margen</option>
          <option value="stock">Stock crítico primero</option>
        </select>
      </div>

      <div className="inv-table">
        <div className="inv-row head">
          <div></div>
          <div>Producto</div>
          <div className="hide-mob">Categoría</div>
          <div className="hide-mob">Costo</div>
          <div className="hide-mob">PVP</div>
          <div>Stock</div>
          <div>Margen</div>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            No se encontraron productos
          </div>
        )}
        {filtered.map(p => {
          const stockPct = Math.min(100, (p.stock / p.optimal) * 100);
          return (
            <div key={p.id} className="inv-row">
              <div className="inv-img">{p.code}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono,monospace', marginTop: 2 }}>SKU {p.sku}</div>
              </div>
              <div className="hide-mob" style={{ color: 'var(--muted)', fontSize: 13 }}>{p.category}</div>
              <div className="hide-mob" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13 }}>
                ${p.cost.toLocaleString('es-AR')}
              </div>
              <div className="hide-mob">
                <EditablePrice value={p.pvp} onSave={v => adjustPrice(p.id, v)} />
              </div>
              <div className="stock-cell">
                <div className="stock-bar" style={{
                  '--w': `${stockPct}%`,
                  '--c': stockPct < 30 ? 'var(--red)' : stockPct < 60 ? 'var(--yellow)' : 'var(--green)'
                }}></div>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, minWidth: 20 }}>{p.stock}</span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: 13, color: statusColor[p.status] }}>
                {p.margin > 0 ? '+' : ''}{p.margin}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
