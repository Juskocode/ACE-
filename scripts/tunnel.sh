#!/usr/bin/env bash
set -euo pipefail

cloudflared tunnel --url http://localhost:3000
