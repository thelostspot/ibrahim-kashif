Ibrahim Kashif — TheLostSpot (Showcase site)
===========================================

What this is
- A static, dark gothic themed product showcase site that lists product names + prices only.
- Admin editor (admin.html) uses a serverless API to publish changes to data/products.json in this repository.

Important: To enable publishing from the editor you must deploy this project to Vercel and set two environment variables:
- ADMIN_PASSWORD — the editor password (keep Allahjee1@ or change it)
- GITHUB_TOKEN — a GitHub personal access token with repo permissions so the server can commit changes

Optional environment variables (defaults used if not set):
- GITHUB_OWNER (default: thelostspot)
- GITHUB_REPO (default: ibrahim-kashif)

Files pushed
- index.html — public listing page
- admin.html — editor page that calls /api/products
- css/styles.css — gothic styling
- js/main.js — public page loader
- js/admin.js — editor client
- api/products.js — Vercel serverless function that reads/writes data/products.json using GitHub API
- data/products.json — initial product list
- package.json — dependency for octokit

Deploy to Vercel (recommended)
1. Go to https://vercel.com and sign in with GitHub.
2. Import the repository thelostspot/ibrahim-kashif.
3. In Project Settings -> Environment Variables add:
   - ADMIN_PASSWORD = Allahjee1@  (or your chosen password)
   - GITHUB_TOKEN = <your GitHub personal access token with repo scope>
   - GITHUB_OWNER = thelostspot
   - GITHUB_REPO = ibrahim-kashif
4. Deploy the project. Vercel will run the serverless API at /api/products.

Domain setup (thelostspot.pk)
- In Vercel dashboard: go to Domains and add thelostspot.pk.
- Vercel will show DNS records. Common records to add at your registrar:
  - A record for @ -> 76.76.21.21
  - CNAME for www -> cname.vercel-dns.com
- Add the records at your domain registrar and wait for propagation (usually minutes to a few hours).

How publishing works
- Open /admin.html on the deployed site, enter the editor password, edit products and click Save.
- The server will commit an updated data/products.json to this repository using the GITHUB_TOKEN. The public site reads data/products.json via /api/products so changes become visible immediately.

Security notes
- Keep your GITHUB_TOKEN secret. In Vercel add it as an environment variable, not in code.
- ADMIN_PASSWORD is kept as an environment variable on the server. Do not hardcode sensitive passwords in client-side code.

If you want me to finish the deploy (connect repo to Vercel and set the environment variables), I can guide you step-by-step or, if you prefer, give me access details so I can finish it for you.
