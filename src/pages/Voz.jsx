import { PageHeader } from '../components/ui';
import VoiceCard from '../components/VoiceCard';

export default function Voz() {
  return (
    <div className="view-enter">
      <PageHeader title="Voz e" accent="imagen." meta1="WHISPER · ES-AR" meta2="RECONOCIMIENTO 96%" />
      <div className="grid-2">
        <VoiceCard big />
        <div className="card">
          <div className="card-tag terra">EJEMPLO REAL</div>
          <div className="card-title">Así lo entendemos</div>
          <div className="card-sub">Transcripción → Inventario</div>
          <div style={{ background: 'var(--bg-soft)', padding: 16, borderRadius: 10, fontFamily: 'JetBrains Mono,monospace', fontSize: 12, lineHeight: 1.7, marginBottom: 16, borderLeft: '3px solid var(--olive)', color: 'var(--ink-soft)' }}>
            "Me quedan cinco latas de atún Gomes da Costa, tres kilos de arroz Gallo doble, y dos paquetes de servilletas Elite blancas grandes"
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>→ Convertido a inventario:</div>
          {[
            { name: 'Atún Gomes da Costa 170g', prev: 12, next: 5, diff: -7 },
            { name: 'Arroz Gallo Doble 1kg', prev: 8, next: 3, diff: -5 },
            { name: 'Servilletas Elite Grandes', prev: 5, next: 2, diff: -3 },
          ].map(item => (
            <div key={item.name} className="semaforo-item">
              <span className="light green"></span>
              <div>
                <div className="prod-name">{item.name}</div>
                <div className="prod-meta">STOCK ANTERIOR: {item.prev} → NUEVO: {item.next}</div>
              </div>
              <div className="margin-pct" style={{ color: 'var(--red)' }}>{item.diff}</div>
            </div>
          ))}
          <div style={{ marginTop: 20, padding: 16, background: 'var(--green-soft)', borderRadius: 10, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            ✅ <strong>El inventario se actualizó.</strong> Los 3 productos están sincronizados. El colateral on-chain recalculado.
          </div>
        </div>
      </div>
    </div>
  );
}
