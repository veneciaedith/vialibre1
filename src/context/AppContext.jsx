import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { initialInventory, wppMessages } from '../data/inventory';

const AppContext = createContext(null);

const ENTITIES_API = '/api/entities';

// Fire-and-forget: registra movimientos en Arkiv sin bloquear la UI
async function postMovements(movements) {
  for (const m of movements) {
    try {
      await fetch(`${ENTITIES_API}?action=recordMovement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      });
    } catch {
      // best-effort: errores de red no deben interrumpir la operación del almacén
    }
  }
}

export function AppProvider({ children }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [messages, setMessages] = useState(wppMessages);
  const [toast, setToast] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [arkivSynced, setArkivSynced] = useState(false);

  // Ref para acceder al estado actual de inventario sin dependencia en callbacks
  const inventoryRef = useRef(initialInventory);

  const showToast = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Aplica una factura escaneada y registra movimientos on-chain
  const applyInvoice = useCallback((lines) => {
    setInventory(prev => {
      const next = [...prev];
      lines.forEach(line => {
        const idx = next.findIndex(p => p.id === line.id);
        if (idx >= 0) next[idx] = { ...next[idx], stock: next[idx].stock + line.qty };
      });
      inventoryRef.current = next;
      return next;
    });

    // Registrar cada entrada de stock como entidad "movement" en Arkiv
    // delta positivo = entrada de mercadería (desde factura de proveedor)
    const movements = lines.map(l => ({
      productId: l.id,
      delta: l.qty,
      reason: 'invoice_scan',
    }));
    postMovements(movements).then(() => setArkivSynced(true));

    showToast(`✓ ${lines.length} productos cargados al inventario. Stock actualizado.`);
  }, [showToast]);

  // Ajustar stock por voz y registrar movimientos on-chain
  const applyVoiceUpdate = useCallback((updates) => {
    const currentInventory = inventoryRef.current;
    const movements = [];

    setInventory(prev => {
      const next = [...prev];
      updates.forEach(u => {
        const idx = next.findIndex(p => p.id === u.id);
        if (idx >= 0) {
          // Calcula el delta real para el registro on-chain
          const delta = u.stock - next[idx].stock;
          movements.push({ productId: u.id, delta, reason: 'voice_update' });
          next[idx] = { ...next[idx], stock: u.stock };
        }
      });
      inventoryRef.current = next;
      return next;
    });

    // Registrar ajustes de voz como entidades "movement" en Arkiv
    if (movements.length) {
      postMovements(movements).then(() => setArkivSynced(true));
    }

    showToast(`✓ Inventario ajustado por voz: ${updates.length} productos.`);
  }, [showToast]);

  // Ajustar PVP y recalcular margen + status
  const adjustPrice = useCallback((id, newPvp) => {
    setInventory(prev => {
      const next = prev.map(p => {
        if (p.id !== id) return p;
        const margin = ((newPvp - p.cost) / newPvp) * 100;
        let status = 'green';
        if (margin < 15) status = 'red';
        else if (margin < 25) status = 'yellow';
        return { ...p, pvp: newPvp, margin: +margin.toFixed(1), status };
      });
      inventoryRef.current = next;
      return next;
    });
    showToast(`✓ Precio actualizado · margen recalculado`);
  }, [showToast]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [
      ...prev,
      { ...msg, time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) },
    ]);
  }, []);

  const value = {
    inventory, setInventory,
    messages, addMessage,
    toast, showToast,
    scannerOpen, setScannerOpen,
    arkivSynced,
    applyInvoice, applyVoiceUpdate, adjustPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
