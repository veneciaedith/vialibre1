import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/ui';
import { useApp } from '../context/AppContext';
import { rules } from '../data/inventory';
import { Send } from 'lucide-react';

const BOT_RESPONSES = {
  'sí': '✓ Pedido generado y programado. Bimbo: 30u (entrega 11hs). Pago $18.000 USDC en escrow. Te aviso cuando llegue el remito.',
  'si': '✓ Pedido generado y programado. Bimbo: 30u (entrega 11hs). Pago $18.000 USDC en escrow. Te aviso cuando llegue el remito.',
  'no': 'Entendido, no pedimos. Revisá el stock mañana. ¿Querés que te recuerde el lunes?',
  'inventario': 'El inventario tiene 412 SKU. Stock crítico: Arroz Gallo (3u), Café Bonafide (4u). ¿Queres que genere un pedido automático?',
  'margen': 'Tu margen promedio hoy es 34,2%. Producto estrella: Coca-Cola 2.25L (+38%). Problema: Aceite Cocinero (+2,1%). ¿Querés que ajuste los precios?',
  'default': 'Entendido. ¿Querés que te ayude con el inventario, los márgenes, o hacer un pedido?',
};

function getBotReply(text) {
  const lower = text.toLowerCase().trim();
  for (const [key, val] of Object.entries(BOT_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return val;
  }
  return BOT_RESPONSES.default;
}

export default function Asistente() {
  const { messages, addMessage, showToast } = useApp();
  const [input, setInput] = useState('');
  const [localRules, setLocalRules] = useState(rules);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'me', text: input };
    addMessage(userMsg);
    setInput('');
    setTimeout(() => {
      addMessage({ from: 'bot', text: getBotReply(input) });
    }, 900);
  };

  const handleAction = (action) => {
    addMessage({ from: 'me', text: action });
    setTimeout(() => addMessage({ from: 'bot', text: getBotReply(action) }), 900);
  };

  const toggleRule = (i) => {
    setLocalRules(prev => prev.map((r, idx) => idx === i ? { ...r, active: !r.active } : r));
    showToast(`Regla "${localRules[i].name}" ${localRules[i].active ? 'desactivada' : 'activada'}`);
  };

  return (
    <div className="view-enter">
      <PageHeader title="Asistente" accent="WhatsApp." meta1="WhatsApp Business API" meta2="+54 9 341 ··· ···" />

      <div className="grid-2">
        {/* Chat en vivo */}
        <div className="card assistant" style={{ padding: 0 }}>
          <div className="wpp-head">
            <div className="wpp-avatar">VL</div>
            <div>
              <div className="wpp-name">Asistente VíaLibre</div>
              <div className="wpp-status">● en línea</div>
            </div>
          </div>
          <div className="wpp-body" ref={bodyRef} style={{ maxHeight: 420, overflowY: 'auto', paddingBottom: 8 }}>
            {messages.map((m, i) => (
              <div key={i} className={'msg' + (m.from === 'me' ? ' me' : '')}
                style={{ animationDelay: '0s' }}>
                {m.text.split('\n').map((line, j) => (
                  <span key={j}>
                    <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                    {j < m.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
                <span className="time">{m.time}</span>
              </div>
            ))}
            {/* Acciones rápidas si el último mensaje es del bot */}
            {messages[messages.length - 1]?.from === 'bot' && (
              <div className="wpp-actions">
                <button className="wpp-action" style={{ background: 'var(--navy)', color: '#fff' }}
                  onClick={() => handleAction('SÍ, PEDIR Y PAGAR')}>SÍ, PEDIR Y PAGAR</button>
                <button className="wpp-action danger" onClick={() => handleAction('Cancelar')}>CANCELAR</button>
                <button className="wpp-action" onClick={() => handleAction('Cambiar cantidad')}>CAMBIAR CANTIDAD</button>
              </div>
            )}
          </div>
          <div className="wpp-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Escribí un mensaje..."
            />
            <button onClick={sendMessage}><Send size={18} /></button>
          </div>
        </div>

        {/* Reglas */}
        <div className="card">
          <div className="card-tag navy">REGLAS ACTIVAS</div>
          <div className="card-title">Automatizaciones</div>
          <div className="card-sub">El asistente te avisa cuando se cumplen estas condiciones</div>
          {localRules.map((r, i) => (
            <div key={i} className="rule-card">
              <div onClick={() => toggleRule(i)} className={'switch' + (r.active ? ' on' : '')} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono,monospace', marginTop: 3 }}>{r.desc}</div>
              </div>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: 16, width: '100%' }}>+ Nueva regla</button>
        </div>
      </div>
    </div>
  );
}
