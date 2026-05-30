import { useState, useEffect, useCallback } from 'react';

const STATUS_API = '/api/collateral';
const ENTITIES_API = '/api/entities';

export function useArkiv() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastTx, setLastTx] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Leer estado de la wallet y chain
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${STATUS_API}?action=status`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de red');
      setStatus(data);
    } catch (e) {
      setError(e.message);
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

  // Registrar stock como colateral on-chain (TX legado)
  const registerStock = useCallback(async (stockValue, skuCount) => {
    setError(null);
    try {
      const res = await fetch(`${STATUS_API}?action=registerStock`, {
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

  // Sincronizar todo el inventario como entidades Arkiv (operación batch)
  // Crea entidades tipo "product" con expiración 30 días
  const syncProducts = useCallback(async (products) => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`${ENTITIES_API}?action=syncProducts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al sincronizar entidades');
      setLastTx({ action: 'syncProducts', synced: data.synced, txHash: data.txHash });
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, []);

  // Registrar un movimiento de stock como entidad Arkiv
  // Crea entidad tipo "movement" (expiración 7 días) vinculada a "product" via productId
  const recordMovement = useCallback(async (productId, delta, reason) => {
    try {
      const res = await fetch(`${ENTITIES_API}?action=recordMovement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, delta, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar movimiento');
      return data;
    } catch (e) {
      // Silencioso: movimientos son best-effort, no bloquean la UX
      console.warn('[useArkiv] recordMovement:', e.message);
      return null;
    }
  }, []);

  // Obtener productos desde Arkiv (con paginación manejada server-side)
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${ENTITIES_API}?action=getProducts`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener productos');
      return data.products;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  // Obtener historial de movimientos de un producto (clave foránea: productId)
  const fetchMovements = useCallback(async (productId) => {
    try {
      const url = productId
        ? `${ENTITIES_API}?action=getMovements&productId=${productId}`
        : `${ENTITIES_API}?action=getMovements`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener movimientos');
      return data.movements;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return {
    status, loading, error, lastTx, syncing,
    fetchStatus, registerStock,
    syncProducts, recordMovement, fetchProducts, fetchMovements,
  };
}
