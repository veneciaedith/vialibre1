// Hook que conecta el frontend con /api/collateral (Arkiv Network)
import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/collateral';

export function useArkiv() {
  const [status, setStatus] = useState(null);   // datos on-chain
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastTx, setLastTx] = useState(null);   // última transacción

  // Leer estado de la wallet y chain
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?action=status`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de red');
      setStatus(data);
    } catch (e) {
      setError(e.message);
      // Fallback con datos mock si la API no está disponible en dev
      setStatus({
        ok: false,
        address: '0x···',
        balance: '0.00',
        blockNumber: '847221',
        chainName: 'Braga',
        network: 'braga (testnet)',
        explorer: 'https://explorer.braga.hoodi.arkiv.network',
        mock: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar stock como colateral on-chain
  const registerStock = useCallback(async (stockValue, skuCount) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?action=registerStock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockValue, skuCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      setLastTx(data);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return { status, loading, error, lastTx, fetchStatus, registerStock };
}
