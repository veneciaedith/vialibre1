import { Camera, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ScannerCard({ big = false }) {
  const { setScannerOpen } = useApp();

  return (
    <div className="card scanner">
      <div className="scanner-inner">
        <div className="card-tag" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>FUNCIÓN 01 · OCR</div>
        <div className="scan-eye">
          <Camera size={32} color="var(--olive-soft)" strokeWidth={1.5} />
          <div className="scan-line"></div>
        </div>
        <h3>{big ? 'Una foto. Todo el ticket cargado.' : 'Sacá una foto. Cargamos todo.'}</h3>
        <p>
          {big
            ? 'Funciona con tickets impresos, manuscritos, fotos borrosas y PDFs reenviados por WhatsApp. Detecta producto, cantidad, precio unitario, IVA y descuentos.'
            : 'El proveedor te dejó una factura en papel o por WhatsApp. La cámara la lee, la IA reconoce productos, cantidades y costos.'}
        </p>
        <button className="scan-btn" onClick={() => setScannerOpen(true)}>
          <Camera size={18} />
          Escanear factura
          <ArrowRight size={16} />
        </button>
        <div className="scan-alt">
          <span onClick={() => setScannerOpen(true)}>📎 Subir imagen</span>
          <span onClick={() => setScannerOpen(true)}>💬 Reenviar de WhatsApp</span>
        </div>
      </div>
    </div>
  );
}
