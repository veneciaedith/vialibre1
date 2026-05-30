# VíaLibre — Sistema operativo del comercio de barrio

> **Hackathon Arkiv × PunaTech 2026** · Deadline: 30 May 2026

**Demo en vivo:** https://vialibre.vercel.app  
**Repositorio:** https://github.com/veneciaedith/vialibre1  
**Red:** Arkiv Braga Testnet · Chain ID `60138453102`  
**Wallet:** `0x4eB764FF52E20868DeDa464aD842b767fbe27c5A`

---

## ¿Qué es VíaLibre?

VíaLibre reemplaza la libreta de papel del almacenero con un sistema operativo digital donde **cada movimiento de stock queda registrado on-chain** usando Arkiv como capa de datos. El comerciante de barrio obtiene:

- Inventario en tiempo real con semáforo de márgenes (rojo/amarillo/verde)
- Score crediticio generado por su operación verificada en blockchain
- Acceso a microcréditos DeFi sin banco ni contador
- Sus datos son suyos — no los tiene la plataforma, los tiene él

---

## Proof of Work — Transacciones reales en Braga Testnet

Todas las transacciones son verificables en el explorador oficial de Arkiv.

### TX 1 · Sincronización inicial de inventario (batch `product` entities)
Crea 12 entidades de tipo `product` en una sola transacción batch.

```
0x726944acc45a44c35cdb958f2a499c8617ff46cc0086e0a9946951696d881574
```
🔗 [Ver en Braga Explorer](https://explorer.braga.hoodi.arkiv.network/tx/0x726944acc45a44c35cdb958f2a499c8617ff46cc0086e0a9946951696d881574)

---

### TX 2 · Movimiento de stock — entrada por factura escaneada (`movement` entity)
Registra la llegada de 30 unidades de Pan Lactal Bimbo (factura de proveedor).  
**Entity Key:** `0xf06f94e043b3c7f8c32482ebd85e699ca74861dea516a9edb237510bc62cff2e`

```
0x3b6fe6cbe2afd307a3f46e1828f39d1c2cef1ac25015b3ebb95a76cd7cccc59a
```
🔗 [Ver en Braga Explorer](https://explorer.braga.hoodi.arkiv.network/tx/0x3b6fe6cbe2afd307a3f46e1828f39d1c2cef1ac25015b3ebb95a76cd7cccc59a)

---

### TX 3 · Movimiento de stock — actualización por voz (`movement` entity)
Registra el ingreso de 40 unidades de Coca-Cola 2.25L por comando de voz.  
**Entity Key:** `0xab7beacc1e998417800bc09d2fa507775eada886d86abf52880f3d126d3e7ddc`

```
0xf159eace230423af7a84105c8432456058fba6e2f61900a8f3fa4244c6d7e4b9
```
🔗 [Ver en Braga Explorer](https://explorer.braga.hoodi.arkiv.network/tx/0xf159eace230423af7a84105c8432456058fba6e2f61900a8f3fa4244c6d7e4b9)

---

## Arquitectura Arkiv

### Dos tipos de entidad

#### `product` — Catálogo de inventario · Expiración: 30 días

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `project` | string | `vialibre-v1` — namespace único del proyecto |
| `type` | string | `product` |
| `productId` | string | ID único del producto |
| `sku` | string | Código SKU (glob queries) |
| `name` | string | Nombre del producto |
| `category` | string | Categoría |
| `status` | string | Semáforo: `red` / `yellow` / `green` |
| `cost` | numeric | Costo de compra (range queries) |
| `pvp` | numeric | Precio de venta (range queries) |
| `stock` | numeric | Unidades en stock (range queries) |
| `margin` | numeric | Margen × 10 + 1000 para soportar negativos |
| `updatedAt` | numeric | Timestamp Unix |

#### `movement` — Historial de movimientos · Expiración: 7 días

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `project` | string | `vialibre-v1` |
| `type` | string | `movement` |
| `productId` | string | **Clave foránea** → `product.productId` |
| `reason` | string | `invoice_scan` / `voice_update` / `manual` |
| `delta` | numeric | Cambio de stock (positivo = entrada) |
| `timestamp` | numeric | Timestamp Unix |

### Relación entre entidades

```
product  { productId: "pan-lactal", stock: 10 }
    ↑  (atributo productId compartido)
movement { productId: "pan-lactal", delta: +30, reason: "invoice_scan" }
movement { productId: "ccola-225",  delta: +40, reason: "invoice_scan" }
```

### PROJECT_ATTRIBUTE

```js
const PROJECT_ATTR = { key: 'project', value: 'vialibre-v1' };
// Estampado en cada entidad y cada query para aislar datos
// en la base de datos pública compartida de Arkiv
```

### Batch + Paginación

```js
// Batch create (TX 1)
await walletClient.mutateEntities({
  creates: products.map(p => ({
    attributes: [
      { key: 'project', value: 'vialibre-v1' },
      { key: 'type', value: 'product' },
      { key: 'stock', value: p.stock },  // numérico → range queries
      // ...
    ],
    expiresIn: ExpirationTime.fromDays(30),
  }))
});

// Paginación automática (cursor-based)
async function queryAll(filter) {
  const all = [];
  let cursor;
  do {
    const result = await rpcQuery(filter, cursor);
    all.push(...result.data);
    cursor = result.cursor; // undefined cuando no hay más páginas
  } while (cursor);
  return all;
}
```

---

## Flujos principales

| Acción del usuario | Lo que pasa on-chain |
|--------------------|----------------------|
| Escanear factura de proveedor | Crea entidad `movement` con `reason: invoice_scan` y `delta = +qty` |
| Actualizar stock por voz | Crea entidad `movement` con `reason: voice_update` y delta calculado |
| Click "Sincronizar SKU on-chain" | Batch de 12 entidades `product` en una TX |
| Score crediticio | Calculado sobre historial de entidades verificadas on-chain |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Routing | React Router v6 |
| Iconos | Lucide React |
| **Data Layer** | **Arkiv Network SDK `@arkiv-network/sdk@0.6.8`** |
| **Blockchain** | **Arkiv Braga Testnet (Chain ID: `60138453102`)** |
| Backend | Vercel Serverless Functions (Node.js 24) |
| Deploy | Vercel |

---

## Setup

### Requisitos
- Node.js 18+
- Wallet con fondos en Braga testnet → [Faucet](https://braga.hoodi.arkiv.network/faucet/)

### Variables de entorno

En Vercel: Settings → Environment Variables

```
PRIVATE_KEY=0x<clave_privada_64_hex>
```

### Instalación local

```bash
git clone https://github.com/veneciaedith/vialibre1
cd vialibre1
npm install
cp .env.example .env   # completar PRIVATE_KEY
npm run dev
```

### API endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/entities?action=getProducts` | GET | Lee entidades `product` (paginación automática) |
| `/api/entities?action=getMovements&productId=xxx` | GET | Historial de movimientos por FK |
| `/api/entities?action=syncProducts` | POST | Crea entidades `product` en batch |
| `/api/entities?action=recordMovement` | POST | Crea entidad `movement` individual |
| `/api/collateral?action=status` | GET | Estado wallet y bloque actual |

---

## Equipo

**Venecia Edith** — Full-stack developer  
veneciaedith@users.noreply.github.com

---

## Licencia

MIT
