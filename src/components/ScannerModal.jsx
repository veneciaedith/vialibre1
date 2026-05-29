import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

// Líneas detectadas por el "OCR"
const detectedLines = [
  { id: 'ccola-225', name: 'Coca-Cola 2.25L', qty: 24, unitPrice: 1380, total: 33120 },
  { id: 'aceite-cocinero', name: 'Aceite Cocinero 900ml', qty: 12, unitPrice: 1880, total: 22560 },
  { id: 'yerba-rosamonte', name: 'Yerba Rosamonte 1kg', qty: 8, unitPrice: 2450, total: 19600 },
  { id: 'harina-pureza', name: 'Harina Pureza 1kg', qty: 20, unitPrice: 980, total: 19600 },
  { id: 'fideos-matarazzo', name: 'Fideos Matarazzo Spaghetti', qty: 15, unitPrice: 540, total: 8100 },
];

export default function ScannerModal() {
  const { scannerOpen, setScannerOpen, applyInvoice } = useApp();
  const [phase, setPhase] = useState('scanning'); // scanning | done

  useEffect(() => {
    if (!scannerOpen) return;
    setPhase('scanning');
    const t = setTimeout(() => setPhase('done'), 2200);
    return () => clearTimeout(t);
  }, [scannerOpen]);

  useEffect(() => {
    const onEsc = e => e.key === 'Escape' && setScannerOpen(false);
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [setScannerOpen]);

  if (!scannerOpen) return null;

  const total = detectedLines.reduce((s, l) => s + l.total, 0);

  const handleConfirm = () => {
    applyInvoice(detectedLines);
    setScannerOpen(false);
  };

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && setScannerOpen(false)}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>Escáner de factura</h3>
          <button className="modal-close" onClick={() => setScannerOpen(false)}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {phase === 'scanning' && (
            <div className="scan-preview">
              <div className="grid-bg"></div>
              <div className="scanline"></div>
              <div className="scan-preview-text">
                <div className="ico">📄</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, marginBottom: 8 }}>
                  Procesando factura...
                </div>
                <div className="blink">DETECTANDO PRODUCTOS</div>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="scan-result view-enter">
              <h4>✓ Factura procesada · Distribuidora Rosario S.A.</h4>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(26,20,16,.55)', marginBottom: 14 }}>
                N° 0001-00284921 · 28/05/2026 · {detectedLines.length} PRODUCTOS DETECTADOS
              </div>
              {detectedLines.map(line => (
                <div key={line.id} className="scan-line-item">
                  <div><strong>{line.name}</strong></div>
                  <div className="qty">×{line.qty}</div>
                  <div className="price">${line.total.toLocaleString('es-AR')}</div>
                </div>
              ))}
              <div className="scan-total">
                <span>TOTAL</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleConfirm}>Cargar al inventario</button>
                <button className="btn-ghost" onClick={() => setScannerOpen(false)}>Revisar manual</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
