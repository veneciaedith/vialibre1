import { createContext, useContext, useState, useCallback } from 'react';
import { initialInventory, wppMessages } from '../data/inventory';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [messages, setMessages] = useState(wppMessages);
  const [toast, setToast] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const showToast = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Aplica una factura escaneada al inventario
  const applyInvoice = useCallback((lines) => {
    setInventory(prev => {
      const next = [...prev];
      lines.forEach(line => {
        const idx = next.findIndex(p => p.id === line.id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], stock: next[idx].stock + line.qty };
        }
      });
      return next;
    });
    showToast(`✓ ${lines.length} productos cargados al inventario. Stock actualizado.`);
  }, [showToast]);

  // Ajustar stock por voz
  const applyVoiceUpdate = useCallback((updates) => {
    setInventory(prev => {
      const next = [...prev];
      updates.forEach(u => {
        const idx = next.findIndex(p => p.id === u.id);
        if (idx >= 0) next[idx] = { ...next[idx], stock: u.stock };
      });
      return next;
    });
    showToast(`✓ Inventario ajustado por voz: ${updates.length} productos.`);
  }, [showToast]);

  // Ajustar precio (PVP) y recalcular margen + status
  const adjustPrice = useCallback((id, newPvp) => {
    setInventory(prev => prev.map(p => {
      if (p.id !== id) return p;
      const margin = ((newPvp - p.cost) / newPvp) * 100;
      let status = 'green';
      if (margin < 15) status = 'red';
      else if (margin < 25) status = 'yellow';
      return { ...p, pvp: newPvp, margin: +margin.toFixed(1), status };
    }));
    showToast(`✓ Precio actualizado · margen recalculado`);
  }, [showToast]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { ...msg, time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }]);
  }, []);

  const value = {
    inventory, setInventory,
    messages, addMessage,
    toast, showToast,
    scannerOpen, setScannerOpen,
    applyInvoice, applyVoiceUpdate, adjustPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
