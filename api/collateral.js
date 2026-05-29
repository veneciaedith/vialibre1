import { createPublicClient, createWalletClient, http, formatEther } from '@arkiv-network/sdk';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { braga } from '@arkiv-network/sdk/chains';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    return res.status(500).json({ error: 'PRIVATE_KEY no configurada en Vercel' });
  }

  // Normalizar: agregar 0x si falta
  if (!PRIVATE_KEY.startsWith('0x')) {
    PRIVATE_KEY = '0x' + PRIVATE_KEY;
  }
  // Validar longitud (debe ser 32 bytes = 64 chars hex + '0x')
  if (PRIVATE_KEY.length !== 66) {
    return res.status(500).json({
      error: `PRIVATE_KEY inválida: longitud ${PRIVATE_KEY.length}, esperada 66 (0x + 64 hex chars)`
    });
  }

  try {
    const publicClient = createPublicClient({
      chain: braga,
      transport: http(),
    });

    const account = privateKeyToAccount(PRIVATE_KEY);
    const address = account.address;

    const walletClient = createWalletClient({
      chain: braga,
      transport: http(),
      account,
    });

    const { action } = req.query;

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
        rpc: braga.rpcUrls.default.http[0],
      });
    }

    if (action === 'registerStock' && req.method === 'POST') {
      const { stockValue, skuCount } = req.body || {};
      const dataHex = `0x${Buffer.from(
        JSON.stringify({ stockValue, skuCount, timestamp: Date.now(), app: 'vialibre' })
      ).toString('hex')}`;

      const hash = await walletClient.sendTransaction({
        to: address,
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
      hint: 'Verificar formato de PRIVATE_KEY en Vercel (con o sin 0x, 64 chars hex)'
    });
  }
}
