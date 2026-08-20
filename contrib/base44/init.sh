#!/bin/sh
# One-shot regtest setup: wait for the node RPC, then mine 101 blocks to a
# fresh wallet address so the chain has height and the wallet has a balance.
set -e

CLI="dogecoin-cli -regtest -datadir=/data -rpcconnect=node -rpcport=18332 -rpcuser=dogecoin -rpcpassword=base44regtest"

echo "[init] waiting for node RPC..."
until $CLI getblockcount >/dev/null 2>&1; do
  sleep 2
done

ADDR=$($CLI getnewaddress)
echo "[init] mining 101 blocks to $ADDR ..."
$CLI generatetoaddress 101 "$ADDR" >/dev/null
echo "[init] done. block count = $($CLI getblockcount)"
