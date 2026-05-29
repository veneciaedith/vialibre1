// Inventario mock — almacén Don Tito, Casilda

export const initialInventory = [
  { id: 'ccola-225', code: 'CC', name: 'Coca-Cola 2.25L', sku: '8410-44', category: 'Bebidas', cost: 1380, pvp: 1900, stock: 42, optimal: 50, status: 'green', margin: 38 },
  { id: 'aceite-cocinero', code: 'AC', name: 'Aceite Cocinero 900ml', sku: '7720-12', category: 'Almacén', cost: 1880, pvp: 1920, stock: 6, optimal: 24, status: 'red', margin: 2.1, alert: 'COSTO ↑18%' },
  { id: 'yerba-rosamonte', code: 'YR', name: 'Yerba Rosamonte 1kg', sku: '7791-08', category: 'Almacén', cost: 2450, pvp: 2800, stock: 14, optimal: 25, status: 'yellow', margin: 14, alert: 'FLETE COMIENDO MARGEN' },
  { id: 'pan-lactal', code: 'PL', name: 'Pan Lactal Bimbo', sku: '7796-01', category: 'Panadería', cost: 680, pvp: 890, stock: 10, optimal: 28, status: 'yellow', margin: 31, alert: 'STOCK BAJO PARA VIERNES' },
  { id: 'harina-pureza', code: 'HP', name: 'Harina Pureza 000 1kg', sku: '7790-22', category: 'Almacén', cost: 980, pvp: 1030, stock: 28, optimal: 30, status: 'red', margin: 4.8, alert: 'AJUSTAR PVP' },
  { id: 'detergente-magistral', code: 'DM', name: 'Detergente Magistral 750ml', sku: '7613-19', category: 'Limpieza', cost: 1250, pvp: 1230, stock: 18, optimal: 20, status: 'red', margin: -1.4, alert: 'PERDIENDO $20/u' },
  { id: 'arroz-gallo', code: 'AG', name: 'Arroz Gallo Doble 1kg', sku: '7790-15', category: 'Almacén', cost: 890, pvp: 1250, stock: 3, optimal: 20, status: 'green', margin: 40, alert: 'STOCK CRÍTICO' },
  { id: 'fideos-matarazzo', code: 'FM', name: 'Fideos Matarazzo Spaghetti', sku: '7790-08', category: 'Almacén', cost: 540, pvp: 640, stock: 22, optimal: 30, status: 'yellow', margin: 16 },
  { id: 'atun-gomes', code: 'AT', name: 'Atún Gomes da Costa 170g', sku: '7790-44', category: 'Conservas', cost: 1100, pvp: 1480, stock: 12, optimal: 20, status: 'green', margin: 34 },
  { id: 'cafe-bonafide', code: 'CB', name: 'Café Bonafide Tradicional 250g', sku: '7790-77', category: 'Almacén', cost: 2200, pvp: 3100, stock: 4, optimal: 15, status: 'red', margin: 40, alert: 'STOCK CRÍTICO' },
  { id: 'servilletas-elite', code: 'SE', name: 'Servilletas Elite Blancas', sku: '7790-92', category: 'Hogar', cost: 380, pvp: 520, stock: 5, optimal: 18, status: 'yellow', margin: 36 },
  { id: 'leche-larga-vida', code: 'LV', name: 'Leche La Serenísima 1L', sku: '7791-01', category: 'Lácteos', cost: 720, pvp: 980, stock: 24, optimal: 30, status: 'green', margin: 36 },
];

export const communityPrices = [
  { id: 'aceite-cocinero', name: 'Aceite Cocinero 900ml', yourPrice: 1880, avgPrice: 1720, diff: -160 },
  { id: 'yerba-rosamonte', name: 'Yerba Rosamonte 1kg', yourPrice: 2450, avgPrice: 2380, diff: -70 },
  { id: 'harina-pureza', name: 'Harina Pureza 1kg', yourPrice: 980, avgPrice: 1080, diff: +100 },
  { id: 'ccola-225', name: 'Coca-Cola 2.25L', yourPrice: 1380, avgPrice: 1420, diff: +40 },
  { id: 'detergente-magistral', name: 'Detergente Magistral', yourPrice: 1250, avgPrice: 1120, diff: -130 },
  { id: 'cafe-bonafide', name: 'Café Bonafide 250g', yourPrice: 2200, avgPrice: 2080, diff: -120 },
];

export const recentInvoices = [
  { provider: 'Distribuidora Rosario S.A.', products: 23, total: 48220, date: 'HOY 09:42', status: 'green' },
  { provider: 'Lácteos del Litoral', products: 11, total: 22110, date: 'AYER 16:18', status: 'green' },
  { provider: 'Bimbo Argentina', products: 8, total: 15640, date: '26/05 11:02', status: 'yellow', note: 'REQUIERE REVISIÓN' },
  { provider: 'Coca-Cola FEMSA', products: 7, total: 18940, date: '25/05 08:15', status: 'green' },
  { provider: 'Bonafide Cafés', products: 5, total: 11200, date: '24/05 14:30', status: 'green' },
];

export const onChainTxs = [
  { type: 'Pago a Bimbo', hash: '0x84f...2c9b', date: 'HOY', amount: -24180, unit: 'USDC' },
  { type: 'Recompensa Data-to-Earn', hash: '0x91a...8d33', date: 'AYER', amount: +142, unit: 'VLA' },
  { type: 'Update colateral verificado', hash: '0x6c2...1ef7', date: 'AYER', amount: +280, unit: 'USDC' },
  { type: 'Pago a Coca FEMSA', hash: '0x3e8...7a01', date: '25/05', amount: -18940, unit: 'USDC' },
  { type: 'Préstamo DeFi (Aave)', hash: '0xbb4...f520', date: '22/05', amount: +2500, unit: 'USDC' },
  { type: 'Recompensa Nestlé', hash: '0x12d...44a8', date: '20/05', amount: +38, unit: 'VLA' },
];

export const wppMessages = [
  { from: 'bot', text: 'Buen día Tito. Te tiro las alertas del día:\n\n🥖 Pan lactal: 10 unid. Viernes vendés ~28. **Pedir 30**.\n☕ Café Bonafide: 4 unid. **Stock crítico**.\n🥤 Coca 2.25L: stock OK pero margen +38% → **pedí más**.', time: '5:08 AM' },
  { from: 'me', text: 'Pedí 30 de pan, 12 de café y 40 de Coca', time: '5:14 AM' },
  { from: 'bot', text: 'Listo. 3 pedidos generados:\n→ Bimbo: 30u (entrega 11hs)\n→ Bonafide: 12u (entrega martes)\n→ FEMSA: 40u (entrega mañana)\n\nPago automático en escrow USDC: $24.180. ¿Confirmo?', time: '5:14 AM' },
  { from: 'me', text: 'Sí confirmo', time: '5:15 AM' },
  { from: 'bot', text: '✓ Escrow desplegado. Bloque #847.221. Te aviso cuando llegue cada pedido para confirmar entrega.', time: '5:15 AM' },
];

export const rules = [
  { name: 'Aviso de stock crítico', desc: 'CUANDO QUEDA <30% DEL STOCK ÓPTIMO', active: true },
  { name: 'Predicción semanal', desc: 'VIERNES 5AM · ANTICIPA FINDE', active: true },
  { name: 'Alerta de precio caído', desc: 'COSTO PROVEEDOR ↑ >10% → ROJO', active: true },
  { name: 'Reporte mensual', desc: 'PRIMER DÍA DEL MES · 8AM', active: false },
  { name: 'Recordatorio de pago', desc: 'VENCIMIENTOS A 7 DÍAS', active: true },
];

export const defiOffers = [
  { protocol: 'Goldfinch Protocol', amount: 8000, rate: 6.8, type: 'PRE-APROBADO', color: 'green', desc: 'Sin garantía adicional' },
  { protocol: 'Aave Argentina Pool', amount: 5500, rate: 4.2, type: 'REVISIÓN AUTO', color: 'yellow', desc: 'Colateral 50%' },
  { protocol: 'Banco Galicia Móvil', amount: 1200000, rate: 78, type: 'TRADICIONAL', color: 'red', desc: 'Requiere recibos · ARS', currency: 'ARS' },
];

export const tokenEarnings = [
  { brand: 'Nestlé Argentina', amount: 38 },
  { brand: 'FEMSA Coca-Cola', amount: 52 },
  { brand: 'Mondelēz', amount: 24 },
  { brand: 'Unilever Cono Sur', amount: 28 },
];
