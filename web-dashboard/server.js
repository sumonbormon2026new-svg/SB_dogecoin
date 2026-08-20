const express = require('express');
const path = require('path');

const RPC_HOST = process.env.RPC_HOST || 'node';
const RPC_PORT = process.env.RPC_PORT || '18332';
const RPC_USER = process.env.RPC_USER || 'dogecoin';
const RPC_PASSWORD = process.env.RPC_PASSWORD || 'base44regtest';

const RPC_URL = `http://${RPC_HOST}:${RPC_PORT}`;
const AUTH = 'Basic ' + Buffer.from(`${RPC_USER}:${RPC_PASSWORD}`).toString('base64');

async function rpc(method, params = []) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: AUTH },
    body: JSON.stringify({ jsonrpc: '1.0', id: 'dash', method, params })
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', async (_req, res) => {
  try {
    const [chain, network, mempool, wallet] = await Promise.all([
      rpc('getblockchaininfo'),
      rpc('getnetworkinfo'),
      rpc('getmempoolinfo'),
      rpc('getwalletinfo').catch(() => null)
    ]);
    res.json({ ok: true, chain, network, mempool, wallet });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.get('/api/mine', async (req, res) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count || '1', 10), 1), 1000);
    const addr = await rpc('getnewaddress');
    const blocks = await rpc('generatetoaddress', [count, addr]);
    res.json({ ok: true, blocks: blocks.length });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`dogecoin dashboard listening on :${PORT}`));
