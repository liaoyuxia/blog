#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if [ ! -d node_modules ]; then
  npm install
fi

npm run dev -- --host 0.0.0.0
