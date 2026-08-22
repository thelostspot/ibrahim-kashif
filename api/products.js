const { Octokit } = require('@octokit/rest');

// Serverless API for Vercel (Node.js).
// - GET: returns data/products.json contents
// - POST: requires JSON body { action: 'check'|'save', password, products }
//   * 'check' verifies password
//   * 'save' commits products to data/products.json (requires GITHUB_TOKEN and ADMIN_PASSWORD env vars)

const OWNER = process.env.GITHUB_OWNER || 'thelostspot';
const REPO = process.env.GITHUB_REPO || 'ibrahim-kashif';
const PATH = 'data/products.json';

module.exports = async (req, res) => {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  if (req.method === 'GET') {
    try {
      const c = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
      const content = Buffer.from(c.data.content, 'base64').toString('utf8');
      const json = JSON.parse(content);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(json);
    } catch (err) {
      // If file not found, return empty list
      if (err.status === 404) return res.status(200).json([]);
      console.error('GET error', err);
      return res.status(500).json({ error: 'Could not read products' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const action = body.action;
      const pwd = body.password || '';
      if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({ ok:false, message: 'Server not configured (ADMIN_PASSWORD missing)' });
      }
      if (action === 'check') {
        if (pwd === process.env.ADMIN_PASSWORD) return res.status(200).json({ ok: true });
        return res.status(401).json({ ok: false });
      }
      if (action === 'save') {
        if (pwd !== process.env.ADMIN_PASSWORD) return res.status(401).json({ ok: false, message: 'Unauthorized' });
        const products = body.products || [];
        const contentStr = JSON.stringify(products, null, 2);
        // get current file to obtain sha (if exists)
        let sha = undefined;
        try {
          const current = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: PATH });
          sha = current.data.sha;
        } catch (e) {
          if (e.status !== 404) throw e;
        }
        const message = 'Update products.json via editor';
        await octokit.repos.createOrUpdateFileContents({
          owner: OWNER,
          repo: REPO,
          path: PATH,
          message,
          content: Buffer.from(contentStr, 'utf8').toString('base64'),
          sha
        });
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ ok:false, message:'Unknown action' });
    } catch (err) {
      console.error('POST error', err);
      return res.status(500).json({ ok:false, message: 'Server error' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end('Method Not Allowed');
};
