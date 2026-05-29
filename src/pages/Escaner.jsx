import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui';
import ScannerCard from '../components/ScannerCard';
import { recentInvoices } from '../data/inventory';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Escaner() {
  const { setScannerOpen } = useApp();
  return (
    <div className="view-enter">
      <PageHeader title="Escáner" accent="inteligente." meta1="OCR · GPT-VISION" meta2="PRECISIÓN 99,2%" />
      <div className="grid-2">
        <ScannerCard big />
        <div className="card">
          <div className="card-tag navy">HISTORIAL · ÚLTIMAS 72HS</div>
          <div className="card-title">Facturas procesadas</div>
          <div className="card-sub">Últimas cargas automáticas</div>
          {recentInvoices.map((inv, i) => (
            <div key={i} className="semaforo-item">
              {inv.status === 'green'
                ? <CheckCircle size={18} color="var(--green)" />
                : <AlertCircle size={18} color="var(--yellow)" />}
              <div>
                <div className="prod-name">{inv.provider}</div>
                <div className="prod-meta">
                  {inv.note || `${inv.products} PRODUCTOS · $${inv.total?.toLocaleString('es-AR')}`}
                </div>
              </div>
              <div className="margin-pct" style={{ color: 'var(--muted)', fontSize: 11 }}>{inv.date}</div>
            </div>
          ))}
          <button className="btn-primary olive" style={{ marginTop: 18, width: '100%' }}
            onClick={() => setScannerOpen(true)}>
            + Nueva factura
          </button>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title">¿Cómo funciona el OCR?</div>
        <div className="card-sub">Tres simples pasos</div>
        <div className="grid-3">
          {[
            { n: '01', title: 'Fotografiás', desc: 'Ticket en papel, foto de WhatsApp, PDF del proveedor. Cualquier formato.' },
            { n: '02', title: 'La IA procesa', desc: 'GPT-Vision detecta productos, cantidades, costos, IVA y descuentos automáticamente.' },
            { n: '03', title: 'Stock actualizado', desc: 'El inventario se actualiza y el colateral on-chain se recalcula al instante.' },
          ].map(step => (
            <div key={step.n} style={{ background: 'var(--bg-soft)', padding: 20, borderRadius: 12 }}>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 28, fontWeight: 700, color: 'var(--navy)', opacity: .2, marginBottom: 8 }}>{step.n}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
