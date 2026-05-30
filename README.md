# VíaLibre — Sistema operativo del comercio de barrio

**Hackathon:** Arkiv × PunaTech 2026  
**Demo:** https://vialibre.vercel.app  
**Red:** Arkiv Braga Testnet (Chain ID: `60138453102`)

---

## ¿Qué es VíaLibre?

VíaLibre reemplaza la libreta de papel del almacenero con un sistema operativo digital donde **cada movimiento de stock queda registrado on-chain** usando Arkiv como capa de datos. El comerciante de barrio obtiene:

- Inventario en tiempo real con semáforo de márgenes
- Score crediticio generado por su operación verificada en blockchain
- Acceso a microcréditos DeFi sin banco ni contador
- Sus datos son suyos — no los tiene la plataforma, los tiene él

---

## Integración Arkiv

### Entidades

El núcleo de datos vive en Arkiv como entidades tipadas, **no en una base de datos centralizada**.

#### Tipo 1: `product` — Catálogo de inventario
| Atributo | Tipo | Propósito |
|----------|------|-----------|
| `project` | string | Namespace del proyecto (`vialibre-v1`) — aísla datos en la DB pública compartida |
| `type` | string | Discriminador de tipo (`product`) |
| `productId` | string | ID único del producto |
| `sku` | string | Código SKU (glob queries) |
| `name` | string | Nombre del producto |
| `category` | string | Categoría (filtros por igualdad) |
| `status` | string | Semáforo: `red` / `yellow` / `green` |
| `$owner` | string | Wallet del comerciante (control de escritura mutable) |
| `cost` | numeric | Costo de compra — permite range queries (`lt`, `gt`) |
| `pvp` | numeric | Precio de venta — range queries |
| `stock` | numeric | Unidades en stock — range queries (ej: `stock < 5`) |
| `margin` | numeric | Margen porcentual — range queries |
| `updatedAt` | numeric | Timestamp de última actualización |

**Expiración:** 30 días (`ExpirationTime.fromDays(30)`)

#### Tipo 2: `movement` — Historial de movimientos de stock
| Atributo | Tipo | Propósito |
|----------|------|-----------|
| `project` | string | Namespace del proyecto |
| `type` | string | Discriminador de tipo (`movement`) |
| `productId` | string | **Clave foránea** → `product.productId` (relación por atributo compartido) |
| `reason` | string | Origen: `invoice_scan` / `voice_update` / `manual` |
| `$owner` | string | Wallet del comerciante |
| `delta` | numeric | Cambio de stock (positivo = entrada, negativo = salida) |
| `timestamp` | numeric | Timestamp Unix del movimiento |

**Expiración:** 7 días (`ExpirationTime.fromDays(7)`) — historial de corto plazo, menor costo en mainnet

### Relación entre entidades

```
product (productId: "ccola-225")
    ↑  (atributo productId compartido — clave foránea)
movement (productId: "ccola-225", delta: +40, reason: "invoice_scan")
movement (productId: "ccola-225", delta: -12, reason: "voice_update")
```

### PROJECT_ATTRIBUTE

```js
const PROJECT_ATTR = { key: 'project', value: 'vialibre-v1' };
```

Estampado en **cada entidad creada** y en **cada query** para prevenir contaminación cruzada en la base de datos pública de Arkiv.

### Operaciones batch

```js
// Sincroniza todo el inventario en una transacción
await walletClient.mutateEntities({
  creates: products.map(p => ({
    payload: toPayload(p),
    contentType: 'application/json',
    attributes: [
      { key: 'project', value: 'vialibre-v1' },
      { key: 'type', value: 'product' },
      { key: 'stock', value: p.stock },  // numérico → range queries
      // ...
    ],
    expiresIn: ExpirationTime.fromDays(30),
  }))
});
```

### Paginación

```js
// Itera todas las páginas hasta agotar el cursor
async function queryAll(filter) {
  const all = [];
  let cursor;
  do {
    const result = await rpcQuery(filter, cursor);
    all.push(...result.data);
    cursor = result.cursor; // undefined si no hay más páginas
  } while (cursor);
  return all;
}
```

---

## Flujos principales

1. **Escanear factura** → `applyInvoice()` actualiza inventario + registra movimientos `invoice_scan` on-chain
2. **Actualizar por voz** → `applyVoiceUpdate()` ajusta stock + registra movimientos `voice_update` on-chain
3. **Sincronizar catálogo** → botón en Capital → batch de entidades `product` en una TX
4. **Score crediticio** → calculado sobre el historial de entidades verificadas on-chain

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Routing | React Router v6 |
| Data Layer | **Arkiv Network SDK `@arkiv-network/sdk@0.6.8`** |
| Blockchain | Arkiv Braga Testnet (Chain ID: `60138453102`) |
| Backend | Vercel Serverless Functions |
| Deploy | Vercel |

---

## Setup

### Requisitos
- Node.js 18+
- Cuenta en Vercel
- Wallet con fondos en Braga testnet → [Faucet](https://braga.hoodi.arkiv.network/faucet/)

### Variables de entorno

Configurar en Vercel: Settings → Environment Variables

```
PRIVATE_KEY=0x<tu_clave_privada_64_hex>
```

### Instalación local

```bash
npm install
npm run dev
```

### API endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/entities?action=getProducts` | GET | Lee entidades `product` con paginación automática |
| `/api/entities?action=getMovements&productId=xxx` | GET | Lee movimientos de un producto (FK) |
| `/api/entities?action=syncProducts` | POST | Crea entidades `product` en batch |
| `/api/entities?action=recordMovement` | POST | Crea entidad `movement` individual |
| `/api/collateral?action=status` | GET | Estado de la wallet on-chain |

---

## Equipo

- **Venecia Edith** — Full-stack developer

---

## Licencia

MIT
