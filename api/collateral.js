// api/collateral.js — Vercel Serverless Function
// La PRIVATE_KEY vive SOLO acá, nunca en el browser
import { createPublicClient, createWalletClient, http, formatEther } from '@arkiv-network/sdk';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { braga } from '@arkiv-network/sdk/chains';

export default async function handler(req, res) {
  // CORS para el frontend de Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: 'PRIVATE_KEY no configurada en variables de entorno' });
  }

  try {
    // Cliente de solo lectura (no necesita clave)
    const publicClient = createPublicClient({
      chain: braga,
      transport: http(),
    });

    // Cuenta del comerciante desde la clave privada
    const account = privateKeyToAccount(PRIVATE_KEY);
    const address = account.address;

    // Cliente con firma (para transacciones)
    const walletClient = createWalletClient({
      chain: braga,
      transport: http(),
      account,
    });

    const { action } = req.query;

    // === GET /api/collateral?action=status ===
    if (!action || action === 'status') {
      const [balance, blockNumber, chainId] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.getBlockNumber(),
        publicClient.getChainId(),
      ]);

      return res.status(200).json({
        ok: true,
        address,
        balance: formatEther(balance),
        balanceWei: balance.toString(),
        blockNumber: blockNumber.toString(),
        chainId: chainId.toString(),
        chainName: braga.name,
        network: braga.network,
        explorer: braga.blockExplorers.default.url,
      });
    }

    // === POST /api/collateral?action=registerStock ===
    // Registra el valor del inventario on-chain como colateral
    if (action === 'registerStock' && req.method === 'POST') {
      const { stockValue, skuCount } = req.body || {};
      
      // Preparar el hash del inventario como data en una transacción simbólica
      // (en producción esto llamaría a un contrato inteligente)
      const dataHex = `0x${Buffer.from(
        JSON.stringify({ stockValue, skuCount, timestamp: Date.now() })
      ).toString('hex')}`;

      const hash = await walletClient.sendTransaction({
        to: address, // self-transaction para registrar datos
        value: 0n,
        data: dataHex,
      });

      return res.status(200).json({
        ok: true,
        action: 'registerStock',
        hash,
        explorerUrl: `${braga.blockExplorers.default.url}/tx/${hash}`,
        stockValue,
        skuCount,
      });
    }

    return res.status(400).json({ error: 'Acción no reconocida', validActions: ['status', 'registerStock'] });

  } catch (err) {
    console.error('[arkiv api error]', err.message);
    return res.status(500).json({
      error: err.message,
      hint: 'Verificar PRIVATE_KEY en Vercel Environment Variables'
    });
  }
}
