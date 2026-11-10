/**
 * Procedural Sublimation Product & Logo Generator
 * Generates high-fidelity mockups for Mugs, Tumblers, T-Shirts, Sweatshirts, Tote Bags, and Pillows
 * matching the original Catalog Express engine.
 */

export interface SublimationProductSpec {
  shape: 'mug' | 'tumbler' | 'tee' | 'tote' | 'pillow';
  body: string;
  bg: string;
  art: [string, string];
  l1: string;
  l2: string;
  name: string;
  price: string;
  cat: string;
  sku: string;
  sizes: string;
  desc: string;
}

export const DEMO_SUBLIMATION_PRODUCTS: SublimationProductSpec[] = [
  { 
    shape: 'mug', 
    body: '#ffffff', 
    bg: '#ffe3ec', 
    art: ['#ff6f91', '#ffc75f'], 
    l1: 'MAMA', 
    l2: 'BEAR', 
    name: 'Mama Bear Mug', 
    price: '14.99', 
    cat: 'Mugs', 
    sku: 'MUG-001', 
    sizes: '11 oz, 15 oz', 
    desc: 'Glossy white ceramic mug with a vibrant sublimated print that will not fade. Dishwasher and microwave safe. The perfect gift for Mother\'s Day or a birthday.' 
  },
  { 
    shape: 'mug', 
    body: '#ffffff', 
    bg: '#e6f0ff', 
    art: ['#3d5a80', '#98c1d9'], 
    l1: 'COFFEE', 
    l2: 'FIRST', 
    name: 'Coffee First Mug', 
    price: '13.50', 
    cat: 'Mugs', 
    sku: 'MUG-002', 
    sizes: '11 oz', 
    desc: 'For everyone who can\'t talk before the first cup. Full-wrap print, glossy finish, comfortable C-shaped handle.' 
  },
  { 
    shape: 'tumbler', 
    body: '#f7f7f7', 
    bg: '#e8f8ef', 
    art: ['#2a9d8f', '#e9c46a'], 
    l1: 'TEACH', 
    l2: 'LOVE', 
    name: 'Teacher Life Tumbler', 
    price: '24.00', 
    cat: 'Tumblers', 
    sku: 'TUM-020', 
    sizes: '20 oz skinny', 
    desc: 'Stainless steel skinny tumbler with lid and straw. Keeps drinks cold for 24 hours and hot for 8. Personalise it with the teacher\'s name.' 
  },
  { 
    shape: 'tee', 
    body: '#ffffff', 
    bg: '#fff1e0', 
    art: ['#f4845f', '#f7b267'], 
    l1: 'RETRO', 
    l2: 'SUNSET', 
    name: 'Retro Sunset T-Shirt', 
    price: '22.00', 
    cat: 'T-Shirts', 
    sku: 'TEE-101', 
    sizes: 'S, M, L, XL, 2XL', 
    desc: 'Soft polyester-feel tee with a bright retro sunset design. Unisex fit, breathable fabric, colours that stay vivid wash after wash.' 
  },
  { 
    shape: 'tee', 
    body: '#f2f2f2', 
    bg: '#f3e8ff', 
    art: ['#7b2cbf', '#ff99c8'], 
    l1: 'DOG', 
    l2: 'MOM', 
    name: 'Dog Mom Tee', 
    price: '21.00', 
    cat: 'T-Shirts', 
    sku: 'TEE-102', 
    sizes: 'XS, S, M, L, XL', 
    desc: 'Show some love for your best friend. Relaxed fit tee with a cute paw-print design.' 
  },
  { 
    shape: 'tee', 
    body: '#ffffff', 
    bg: '#e3f6f5', 
    art: ['#d62828', '#2a9d8f'], 
    l1: 'MERRY', 
    l2: 'VIBES', 
    name: 'Christmas Vibes Sweatshirt', 
    price: '32.00', 
    cat: 'Holiday', 
    sku: 'SWT-210', 
    sizes: 'S, M, L, XL', 
    desc: 'Cozy crewneck sweatshirt for the holiday season. Matching family sets available - ask us for bulk pricing.' 
  },
  { 
    shape: 'tote', 
    body: '#f5ecd7', 
    bg: '#eef6e2', 
    art: ['#6a994e', '#f2e8cf'], 
    l1: 'WILD', 
    l2: 'FLOWER', 
    name: 'Wildflower Tote Bag', 
    price: '16.00', 
    cat: 'Bags', 
    sku: 'BAG-301', 
    sizes: '15 x 16 in', 
    desc: 'Sturdy canvas-look tote with long handles. Great for groceries, books and the beach.' 
  },
  { 
    shape: 'mug', 
    body: '#ffffff', 
    bg: '#e9ecef', 
    art: ['#264653', '#e76f51'], 
    l1: 'BEST DAD', 
    l2: 'EVER', 
    name: 'Best Dad Ever Mug', 
    price: '14.99', 
    cat: 'Mugs', 
    sku: 'MUG-003', 
    sizes: '11 oz, 15 oz', 
    desc: 'The classic Father\'s Day gift. Add a photo or the kids\' names at no extra cost.' 
  },
  { 
    shape: 'tee', 
    body: '#ffffff', 
    bg: '#fde2c8', 
    art: ['#ff7b00', '#3c096c'], 
    l1: 'SPOOKY', 
    l2: 'SEASON', 
    name: 'Spooky Season Tee', 
    price: '20.00', 
    cat: 'Holiday', 
    sku: 'TEE-131', 
    sizes: 'S, M, L, XL', 
    desc: 'Halloween is coming! Fun orange and purple design for the whole family.' 
  },
  { 
    shape: 'pillow', 
    body: '#ffffff', 
    bg: '#fbe7f0', 
    art: ['#e5989b', '#b5838d'], 
    l1: 'HOME', 
    l2: 'SWEET HOME', 
    name: 'Custom Name Pillow', 
    price: '27.00', 
    cat: 'Home Decor', 
    sku: 'PIL-401', 
    sizes: '16 x 16 in, 18 x 18 in', 
    desc: 'Soft pillow cover with insert, personalised with a family name and date. A wedding and housewarming favourite.' 
  },
  { 
    shape: 'tote', 
    body: '#fff8e1', 
    bg: '#fff6cc', 
    art: ['#f9c74f', '#277da1'], 
    l1: 'BEE', 
    l2: 'KIND', 
    name: 'Bee Kind Tote', 
    price: '15.00', 
    cat: 'Bags', 
    sku: 'BAG-302', 
    sizes: '15 x 16 in', 
    desc: 'Cheerful bee design on a natural-tone tote. Reusable and strong.' 
  },
  { 
    shape: 'tumbler', 
    body: '#ffffff', 
    bg: '#e0f2fe', 
    art: ['#0077b6', '#90e0ef'], 
    l1: 'ADVENTURE', 
    l2: 'AWAITS', 
    name: 'Mountain Adventure Tumbler', 
    price: '26.00', 
    cat: 'Tumblers', 
    sku: 'TUM-030', 
    sizes: '20 oz, 30 oz', 
    desc: 'Double-wall insulated tumbler with a mountain landscape print. Built for road trips and early hikes.' 
  }
];

function mix(color1: string, color2: string, weight: number): string {
  const d2h = (d: number) => Math.round(d).toString(16).padStart(2, '0');
  const h2d = (h: string) => parseInt(h, 16);
  const c1 = color1.replace('#', '');
  const c2 = color2.replace('#', '');
  const r1 = h2d(c1.substring(0, 2)), g1 = h2d(c1.substring(2, 4)), b1 = h2d(c1.substring(4, 6));
  const r2 = h2d(c2.substring(0, 2)), g2 = h2d(c2.substring(2, 4)), b2 = h2d(c2.substring(4, 6));
  const w = Math.max(0, Math.min(1, weight));
  const r = r1 * (1 - w) + r2 * w;
  const g = g1 * (1 - w) + g2 * w;
  const b = b1 * (1 - w) + b2 * w;
  return `#${d2h(r)}${d2h(g)}${d2h(b)}`;
}

function shade(hex: string, t: number): string {
  return t > 0 ? mix(hex, '#ffffff', t) : mix(hex, '#000000', -t);
}

function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, s: SublimationProductSpec) {
  ctx.save();
  rrPath(ctx, x, y, w, h, Math.min(w, h) * 0.08);
  ctx.clip();
  
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, s.art[0]);
  g.addColorStop(1, s.art[1]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.95, w * (0.18 + i * 0.13), Math.PI, 0);
    ctx.lineWidth = w * 0.035;
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.62, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = w * 0.02;
  
  let fs = h * 0.22;
  ctx.font = `900 ${fs}px Arial Black, Arial, sans-serif`;
  while (ctx.measureText(s.l1).width > w * 0.86 && fs > 8) {
    fs *= 0.92;
    ctx.font = `900 ${fs}px Arial Black, Arial, sans-serif`;
  }
  ctx.fillText(s.l1, x + w / 2, y + h * 0.33);
  
  let fs2 = h * 0.13;
  ctx.font = `bold ${fs2}px Georgia, serif`;
  while (ctx.measureText(s.l2).width > w * 0.86 && fs2 > 8) {
    fs2 *= 0.92;
    ctx.font = `bold ${fs2}px Georgia, serif`;
  }
  ctx.fillText(s.l2, x + w / 2, y + h * 0.56);
  ctx.restore();
}

/**
 * Draws a realistic sublimation product onto a canvas and returns its data URL
 */
export function generateSublimationMockup(s: SublimationProductSpec, N = 800): string {
  const canvas = document.createElement('canvas');
  canvas.width = N;
  canvas.height = N;
  const c = canvas.getContext('2d')!;

  // Background radial gradient
  const bg = s.bg;
  const g = c.createRadialGradient(N * 0.5, N * 0.4, N * 0.05, N * 0.5, N * 0.5, N * 0.75);
  g.addColorStop(0, shade(bg, 0.55));
  g.addColorStop(1, shade(bg, -0.06));
  c.fillStyle = g;
  c.fillRect(0, 0, N, N);

  // Soft bottom cast shadow
  c.fillStyle = 'rgba(0,0,0,.13)';
  c.beginPath();
  c.ellipse(N * 0.5, N * 0.86, N * 0.3, N * 0.045, 0, 0, Math.PI * 2);
  c.fill();

  const body = s.body;
  const edge = shade(body, -0.16);

  const bodyGrad = (x0: number, x1: number) => {
    const gg = c.createLinearGradient(x0, 0, x1, 0);
    gg.addColorStop(0, shade(body, -0.12));
    gg.addColorStop(0.35, body);
    gg.addColorStop(0.7, shade(body, -0.03));
    gg.addColorStop(1, shade(body, -0.2));
    return gg;
  };

  c.lineWidth = N * 0.006;
  c.strokeStyle = edge;

  if (s.shape === 'mug') {
    const x = N * 0.24, y = N * 0.24, w = N * 0.42, h = N * 0.6;
    // C-handle
    c.lineWidth = N * 0.05;
    c.strokeStyle = shade(body, -0.1);
    c.beginPath();
    c.ellipse(x + w + N * 0.02, y + h * 0.48, N * 0.11, N * 0.15, 0, -Math.PI / 2, Math.PI / 2);
    c.stroke();
    // Mug Body
    c.fillStyle = bodyGrad(x, x + w);
    rrPath(c, x, y, w, h, N * 0.04);
    c.fill();
    c.lineWidth = N * 0.004;
    c.strokeStyle = edge;
    c.stroke();
    // Mug Rim Top Ellipse
    c.fillStyle = shade(body, -0.22);
    c.beginPath();
    c.ellipse(x + w / 2, y + N * 0.012, w / 2 - N * 0.01, N * 0.03, 0, 0, Math.PI * 2);
    c.fill();
    // Art print
    drawArt(c, x + w * 0.12, y + h * 0.18, w * 0.76, h * 0.62, s);
  } else if (s.shape === 'tumbler') {
    const cx = N / 2, top = N * 0.16, bot = N * 0.84, wt = N * 0.3, wb = N * 0.24;
    // Tumbler Body
    c.fillStyle = bodyGrad(cx - wt / 2, cx + wt / 2);
    c.beginPath();
    c.moveTo(cx - wt / 2, top + N * 0.06);
    c.lineTo(cx + wt / 2, top + N * 0.06);
    c.lineTo(cx + wb / 2, bot);
    c.lineTo(cx - wb / 2, bot);
    c.closePath();
    c.fill();
    c.stroke();
    // Lid
    c.fillStyle = '#d9d9de';
    rrPath(c, cx - wt / 2 - N * 0.01, top, wt + N * 0.02, N * 0.065, N * 0.015);
    c.fill();
    // Straw
    c.fillStyle = '#c4c4cc';
    c.fillRect(cx + N * 0.04, top - N * 0.1, N * 0.018, N * 0.12);
    // Art
    drawArt(c, cx - wt * 0.4, top + N * 0.17, wt * 0.8, N * 0.42, s);
  } else if (s.shape === 'tee') {
    const cx = N / 2;
    c.fillStyle = bodyGrad(N * 0.18, N * 0.82);
    c.beginPath();
    c.moveTo(cx - N * 0.09, N * 0.17);
    c.quadraticCurveTo(cx, N * 0.23, cx + N * 0.09, N * 0.17);
    c.lineTo(cx + N * 0.22, N * 0.21);
    c.lineTo(cx + N * 0.36, N * 0.36);
    c.lineTo(cx + N * 0.28, N * 0.44);
    c.lineTo(cx + N * 0.2, N * 0.38);
    c.lineTo(cx + N * 0.2, N * 0.84);
    c.lineTo(cx - N * 0.2, N * 0.84);
    c.lineTo(cx - N * 0.2, N * 0.38);
    c.lineTo(cx - N * 0.28, N * 0.44);
    c.lineTo(cx - N * 0.36, N * 0.36);
    c.lineTo(cx - N * 0.22, N * 0.21);
    c.closePath();
    c.fill();
    c.stroke();
    // Collar rib
    c.strokeStyle = shade(body, -0.2);
    c.lineWidth = N * 0.012;
    c.beginPath();
    c.moveTo(cx - N * 0.09, N * 0.17);
    c.quadraticCurveTo(cx, N * 0.23, cx + N * 0.09, N * 0.17);
    c.stroke();
    // Graphic
    drawArt(c, cx - N * 0.13, N * 0.32, N * 0.26, N * 0.3, s);
  } else if (s.shape === 'tote') {
    const x = N * 0.25, y = N * 0.33, w = N * 0.5, h = N * 0.52;
    // Straps
    c.strokeStyle = shade(body, -0.25);
    c.lineWidth = N * 0.025;
    c.beginPath();
    c.moveTo(x + w * 0.25, y + 4);
    c.bezierCurveTo(x + w * 0.25, y - N * 0.22, x + w * 0.75, y - N * 0.22, x + w * 0.75, y + 4);
    c.stroke();
    // Bag Body
    c.fillStyle = bodyGrad(x, x + w);
    c.fillRect(x, y, w, h);
    c.lineWidth = N * 0.004;
    c.strokeStyle = edge;
    c.strokeRect(x, y, w, h);
    // Graphic
    drawArt(c, x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.6, s);
  } else {
    // Pillow / Cushion
    const x = N * 0.18, y = N * 0.2, w = N * 0.64, h = N * 0.6;
    c.fillStyle = bodyGrad(x, x + w);
    rrPath(c, x, y, w, h, N * 0.09);
    c.fill();
    c.lineWidth = N * 0.004;
    c.strokeStyle = edge;
    c.stroke();
    // Graphic
    drawArt(c, x + w * 0.14, y + h * 0.16, w * 0.72, h * 0.62, s);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Draws the Sunny Prints Co. sunshine logo
 */
export function generateDemoLogo(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 240;
  const c = canvas.getContext('2d')!;

  // Warm Sun Icon
  c.fillStyle = '#ff8a3d';
  c.beginPath();
  c.arc(110, 120, 62, 0, Math.PI * 2);
  c.fill();

  c.strokeStyle = '#ff8a3d';
  c.lineWidth = 12;
  c.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    c.beginPath();
    c.moveTo(110 + Math.cos(a) * 78, 120 + Math.sin(a) * 78);
    c.lineTo(110 + Math.cos(a) * 100, 120 + Math.sin(a) * 100);
    c.stroke();
  }

  c.fillStyle = '#ffffff';
  c.font = '900 52px Arial Black, Arial, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('SP', 110, 123);

  c.fillStyle = '#1e1b2e';
  c.textAlign = 'left';
  c.font = '900 64px Arial Black, Arial, sans-serif';
  c.fillText('Sunny', 232, 92);

  c.fillStyle = '#e11d74';
  c.font = 'bold 50px Georgia, serif';
  c.fillText('Prints Co.', 232, 162);

  return canvas.toDataURL('image/png');
}
