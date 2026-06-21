# GST Invoice Calculator 🇮🇳

A free, fast **Indian GST & invoice calculator**. Add line items, split
**CGST + SGST** (intra-state) or **IGST** (inter-state), handle
**GST-inclusive or exclusive** pricing, apply a discount, and get an instant,
printable invoice. 100% client-side — no signup, no data leaves your browser.

🔗 **Live demo:** https://digital-heros-phi.vercel.app/

**Built for Digital Heroes** → https://digitalheroesco.com

## Why this tool
Anyone billing in India constantly needs to work out the tax split on a quote
or invoice — and most free calculators get the CGST/SGST vs IGST split or the
"price already includes GST" case wrong. This does both correctly and shows a
clean per-rate tax breakup you can print.

## Features
- Multiple line items (description, qty, rate, per-item GST rate)
- GST rate presets: 0 / 5 / 12 / 18 / 28 %
- Intra-state (CGST + SGST) vs inter-state (IGST) toggle
- GST-exclusive vs GST-inclusive (reverse) pricing
- Optional discount %
- Per-rate tax summary, round-off, grand total
- Print / Save as PDF

## Tech
Next.js (App Router) + TypeScript + Tailwind CSS. Deploys free on Vercel.

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Configure your details
Your name and email shown on the page live in [`src/lib/site.ts`](src/lib/site.ts) —
edit `OWNER_NAME` and `OWNER_EMAIL`.

---
Built by **Sujal** · sujalsharma1786@gmail.com
