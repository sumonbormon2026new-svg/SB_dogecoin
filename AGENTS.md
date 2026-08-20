# Base44 Dev Environment — Dogecoin Core

This repo is **Dogecoin Core**, a native C++ cryptocurrency node (Bitcoin Core fork).
It has no web UI, so the Base44 setup adds a small live-reload web dashboard that
talks to the node's JSON-RPC and serves it on port 3000 (the preview entry point).

## Architecture

- `node` — compiles `dogecoind` from source (`Dockerfile.node`, multi-stage Ubuntu 22.04)
  and runs it in **regtest** mode with a wallet. RPC on `18332`, P2P on `18444`.
  Data persists in the `node-data` named volume.
- `init` — one-shot service that waits for the node RPC then mines 101 blocks to a
  fresh wallet address (`contrib/base44/init.sh`) so the chain has height/balance.
- `web` — Node.js + Express dashboard (`web-dashboard/`), bind-mounted with nodemon
  live reload, on host port `3000`. It proxies RPC calls to `node:18332` (internal
  docker network), so the browser only talks to port 3000 — no CORS concerns.

No external secrets are required: it is a fully local regtest node.

## Build notes

- The daemon is built with `--without-gui --disable-tests --disable-bench --without-miniupnpc`;
  the wallet is **enabled** (needs BerkeleyDB 5.3, installed via apt `libdb5.3++-dev`).
- secp256k1 / leveldb / univalue are in-tree (no git submodules).
- C++ source edits require rebuilding the node image:
  `docker compose -f docker-compose.base44.yml build node` then `up -d`.
- Dashboard edits (HTML / server.js) hot-reload via nodemon + browser refresh.

## Verify

- `docker compose -f docker-compose.base44.yml ps` — `node`/`web` healthy, `init` exited 0.
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` returns the dashboard.
- Dashboard shows block height 101, wallet balance > 0; "Mine 1 block" button works.
