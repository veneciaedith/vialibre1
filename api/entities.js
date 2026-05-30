import { createWalletClient, http } from '@arkiv-network/sdk';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { braga } from '@arkiv-network/sdk/chains';
import { ExpirationTime } from '@arkiv-network/sdk/utils';

// Namespace único que se estampa en cada entidad y query para evitar colisiones
// en la base de datos pública compartida de Arkiv
const PROJECT_ATTR = { key: 'project', value: 'vialibre-v1' };

const RPC_URL = 'https://braga.hoodi.arkiv.network/rpc';

// Convierte datos a bytes hex para el payload de la entidad
function toPayload(data) {
  return `0x${Buffer.from(JSON.stringify(data)).toString('hex')}`;
}

// Ejecuta una query arkiv_query directamente via JSON-RPC
async function rpcQuery(filter, cursor) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'arkiv_query',
      params: [
        filter,
        {
          resultsPerPage: '0x32', // 50 por página
          includeData: {
            key: true, attributes: true, payload: false,
            creator: true, owner: true, expiration: true,
          },
          ...(cursor && { cursor }),
        },
      ],
    }),
  });

  const json = await res.json();
  if (json.error) throw new Error(json.error.message || 'Error RPC');
  return json.result; // { data, blockNumber, cursor? }
}

// Pagina automáticamente hasta obtener todas las entidades
async function queryAll(filter) {
  const all = [];
  let cursor;
  do {
    const result = await rpcQuery(filter, cursor);
    all.push(...(result.data || []));
    cursor = result.cursor; // presente solo si hay más páginas
  } while (cursor);
  return all;
}

// Normaliza atributos tipados a un objeto plano
function parseEntity(e) {
  const attrs = {};
  (e.stringAttributes || []).forEach(a => { attrs[a.key] = a.value; });
  (e.numericAttributes || []).forEach(a => { attrs[a.key] = Number(a.value); });
  return {
    ...attrs,
    entityKey: e.key,
    creator: e.creator,
    owner: e.owner,
    expiresAt: e.expiresAt,
  };
}

function validatePrivateKey(key) {
  if (!key) return { error: 'PRIVATE_KEY no configurada en Vercel' };
  if (!key.startsWith('0x')) key = '0x' + key;
  if (key.length !== 66) return { error: `PRIVATE_KEY inválida: longitud ${key.length}, esperada 66` };
  return { key };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, productId } = req.query;

  try {
    // ── Acciones de lectura: no requieren wallet ──────────────────────────────

    if (action === 'getProducts') {
      // Tipo de entidad 1: product — expiración 30 días
      // Incluye PROJECT_ATTR en el filter para aislar datos del proyecto
      const filter = `${PROJECT_ATTR.key} = "${PROJECT_ATTR.value}" && type = "product"`;
      const entities = await queryAll(filter);
      return res.status(200).json({ ok: true, products: entities.map(parseEntity) });
    }

    if (action === 'getMovements') {
      // Tipo de entidad 2: movement — expiración 7 días
      // Vinculado a product via atributo productId (clave foránea por atributo compartido)
      const filter = productId
        ? `${PROJECT_ATTR.key} = "${PROJECT_ATTR.value}" && type = "movement" && productId = "${productId}"`
        : `${PROJECT_ATTR.key} = "${PROJECT_ATTR.value}" && type = "movement"`;
      const entities = await queryAll(filter);
      return res.status(200).json({ ok: true, movements: entities.map(parseEntity) });
    }

    // ── Acciones de escritura: requieren wallet ───────────────────────────────

    const { key: PRIVATE_KEY, error: keyError } = validatePrivateKey(process.env.PRIVATE_KEY);
    if (keyError) return res.status(500).json({ error: keyError });

    const account = privateKeyToAccount(PRIVATE_KEY);
    const walletClient = createWalletClient({ chain: braga, transport: http(), account });

    if (action === 'syncProducts' && req.method === 'POST') {
      const { products } = req.body || {};
      if (!products?.length) return res.status(400).json({ error: 'products[] requerido' });

      // Operación batch: crea todas las entidades de producto en una transacción
      // Entidad tipo "product": expiresIn 30 días (catálogo estable)
      const creates = products.map(p => ({
        payload: toPayload(p),
        contentType: 'application/json',
        attributes: [
          { key: PROJECT_ATTR.key, value: PROJECT_ATTR.value }, // namespace del proyecto
          { key: 'type', value: 'product' },
          // $owner y $creator son sintéticos — los asigna el SDK automáticamente desde la wallet firmante
          // Atributos string (igualdad y glob)
          { key: 'productId', value: String(p.id) },
          { key: 'sku', value: String(p.sku) },
          { key: 'name', value: String(p.name) },
          { key: 'category', value: String(p.category) },
          { key: 'status', value: String(p.status) },
          // Atributos numéricos (permiten range queries: gt, lt, gte, lte)
          // El SDK convierte a BigInt: se usan enteros (margin * 10 para preservar 1 decimal)
          { key: 'cost', value: Math.round(Number(p.cost)) },
          { key: 'pvp', value: Math.round(Number(p.pvp)) },
          { key: 'stock', value: Math.round(Number(p.stock)) },
          // margin almacenado con offset +1000 para soportar negativos (ej: -1.4% → 986, 40% → 1400)
          { key: 'margin', value: Math.round(Number(p.margin) * 10) + 1000 },
          { key: 'updatedAt', value: Date.now() },
        ],
        expiresIn: ExpirationTime.fromDays(30), // catálogo de productos: 30 días
      }));

      const result = await walletClient.mutateEntities({ creates });
      return res.status(200).json({
        ok: true,
        synced: products.length,
        txHash: result?.txHash,
        entityKeys: result?.entityKeys,
      });
    }

    if (action === 'recordMovement' && req.method === 'POST') {
      const { productId: pid, delta, reason } = req.body || {};
      if (!pid) return res.status(400).json({ error: 'productId requerido' });

      // Entidad tipo "movement": expiración 7 días (historial de corto plazo)
      // Vinculada a "product" via atributo productId (clave foránea por atributo compartido)
      const { entityKey, txHash } = await walletClient.createEntity({
        payload: toPayload({ productId: pid, delta, reason, timestamp: Date.now() }),
        contentType: 'application/json',
        attributes: [
          { key: PROJECT_ATTR.key, value: PROJECT_ATTR.value },
          { key: 'type', value: 'movement' },
          // FK: mismo valor que productId en la entidad product
          { key: 'productId', value: String(pid) },
          { key: 'reason', value: String(reason || 'manual') },
          // Numérico para permitir queries de rango (ej: delta > 0 = entrada de stock)
          { key: 'delta', value: Math.round(Number(delta || 0)) },
          { key: 'timestamp', value: Date.now() },
        ],
        expiresIn: ExpirationTime.fromDays(7), // movimientos: 7 días de historial
      });

      return res.status(200).json({ ok: true, entityKey, txHash });
    }

    return res.status(400).json({
      error: 'Acción no reconocida',
      validActions: ['getProducts', 'getMovements', 'syncProducts', 'recordMovement'],
    });

  } catch (err) {
    console.error('[entities api error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
