# Catalog Express by This Man Makes

Create printable wholesale & trade product catalogues for UK and international retail, exhibitions, and interior designers. Tailored for the UK market with default £ GBP pricing and standard A4 lookbook exports.

## Key Features
- **UK Market Native**: All prices formatted in **£** (GBP) by default, standard UK A4 paper sizing (210 × 297 mm), and British English spelling conventions.
- **"This Man Makes" Design System**: Crisp light SaaS aesthetic with clean white cards, subtle slate borders, and readable typography inspired by Calendar Creator.
- **Multi-Catalogue Management**: Create, rename, duplicate, delete, and switch between separate collections.
- **100% Client-Side Storage**: Powered by IndexedDB (`catalog-express-v2`). Zero external database costs, 100% private, works completely offline.
- **Batch Product Upload**: Upload dozens of images at once; automatic filename-to-title cleaning and high-fidelity thumbnail generation.
- **4 Layout Engines**:
  - `Grid 2x2`: High-impact large cards with title, price, SKU, and sizes.
  - `Grid 3x3`: Compact 9-up gallery grid for broad collections.
  - `5-Row List`: Editorial stacked layout with detailed descriptions & specs.
  - `Lookbook 1-Hero`: Museum-grade single product exhibition page with gallery plaque.
- **Interactive Room Mockup Visualizer**: Preview artworks framed in real-scale architectural spaces with customizable wall paint shades.
- **A4 PDF Exporter**:
  - **Light PDF**: Optimised for WhatsApp, email, and mobile messaging.
  - **High Quality Print PDF**: High-resolution ~300 DPI for commercial printing & wholesale lookbooks.
  - **Web Share API**: 1-click sharing on mobile devices.
- **Backup & Restore**: Export and import complete catalogue data and images via JSON.

---

## Deploying to GitHub & Vercel with a Custom Domain

### 1. Initialize Git & Push to GitHub

From your project folder in your terminal:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Catalog Express by This Man Makes"

# 4. Rename branch to main
git branch -M main

# 5. Link to your GitHub repository (create a new repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push to GitHub
git push -u origin main
```

---

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** > **"Project"**.
3. Import your GitHub repository (`YOUR_REPO_NAME`).
4. Vercel automatically detects the Vite framework settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**. Your application will be live in ~30 seconds on a `*.vercel.app` URL.

---

### 3. Add Your Custom Domain

1. In your Vercel Dashboard, select your project.
2. Navigate to **Settings** > **Domains**.
3. Enter your domain name (e.g. `catalog.yourbrand.com` or `yourbrandart.com`) and click **Add**.
4. Configure your DNS provider (Cloudflare, GoDaddy, Namecheap, Google Domains, etc.):
   - **For Subdomain (e.g. `catalog.yourbrand.com`)**:
     - Type: `CNAME`
     - Name: `catalog`
     - Target: `cname.vercel-dns.com`
   - **For Apex Domain (e.g. `yourbrandart.com`)**:
     - Type: `A`
     - Name: `@`
     - Value: `76.76.21.21`
5. Vercel automatically issues and renews free SSL certificates (HTTPS). Once DNS propagates (usually 1–5 minutes), your custom domain is live!

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server starts at `http://localhost:3000`.
