import { Mic, Trash2 } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

export default function VoiceCard({ big = false }) {
  const { recording, transcript, done, toggle, updates } = useVoiceRecorder();
  const productNames = {
    'atun-gomes': 'Atún 170g',
    'arroz-gallo': 'Arroz 1kg',
    'servilletas-elite': 'Servilletas',
  };

  return (
    <div className="card voice-card">
      <div className="card-tag terra">FUNCIÓN 02 · VOZ</div>
      <h3>{big ? 'Hablale al teléfono.' : 'Andá por las góndolas hablando.'}</h3>
      <p>{big
        ? 'Caminá por tus estantes nombrando lo que tenés. La IA entiende cantidades, productos y unidades.'
        : '"Me quedan 5 latas de atún, 3 kilos de arroz, 2 servilletas". Listo.'}</p>

      <div style={{ display: 'flex', justifyContent: 'center', padding: big ? '20px 0' : '10px 0' }}>
        <button
          className={'mic-btn' + (recording ? ' recording' : '')}
          style={big ? { width: 110, height: 110 } : undefined}
          onClick={toggle}
          aria-label="Grabar voz"
        >
          <Mic size={big ? 38 : 28} />
        </button>
      </div>

      <div className={'voice-wave' + (recording ? '' : ' idle')}>
        {Array.from({ length: 9 }).map((_, i) => <span key={i} className="bar" />)}
      </div>

      <div className="voice-transcript">
        {!transcript && !done && <span style={{ color: 'var(--muted)' }}>Esperando voz...</span>}
        {transcript && !done && <span className="voice-typing">{transcript}</span>}
        {done && (
          <>
            <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 6 }}>
              ✓ TRANSCRITO · INVENTARIO ACTUALIZADO
            </div>
            <div style={{ color: 'var(--ink-soft)' }}>{transcript}</div>
          </>
        )}
      </div>

      {done && (
        <div className="voice-items">
          {updates.map(u => (
            <div key={u.id} className="voice-item">
              <span className="qty">{u.stock}×</span>
              <span style={{ fontWeight: 500 }}>{productNames[u.id] || u.id}</span>
              <button className="trash" aria-label="Eliminar"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
