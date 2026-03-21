#!/usr/bin/env bash
# =============================================================================
# Caishen — Installation Script
# =============================================================================
# Usage:
#   bash install.sh              # full install + build
#   bash install.sh --no-build  # install deps only, skip build
#   bash install.sh --dev       # also provisions a local dev wallet
# =============================================================================

set -euo pipefail

# ─── Colours ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}  ✔${RESET}  $*"; }
info() { echo -e "${CYAN}  →${RESET}  $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET}  $*"; }
err()  { echo -e "${RED}  ✘${RESET}  $*" >&2; }
head() { echo -e "\n${BOLD}${CYAN}$*${RESET}"; }

# ─── Flags ───────────────────────────────────────────────────────────────────
DO_BUILD=true
DO_PROVISION=false

for arg in "$@"; do
  case "$arg" in
    --no-build)   DO_BUILD=false ;;
    --dev)        DO_PROVISION=true ;;
    --help|-h)
      echo "Usage: bash install.sh [--no-build] [--dev] [--help]"
      echo ""
      echo "  --no-build   Skip pnpm -r build step"
      echo "  --dev        Also run 'caishen provision --mode wdk-local' after build"
      exit 0
      ;;
    *)
      err "Unknown flag: $arg"
      echo "Run 'bash install.sh --help' for usage."
      exit 1
      ;;
  esac
done

# ─── Banner ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║         Caishen — Installer          ║${RESET}"
echo -e "${BOLD}${CYAN}║  Agentic Wallet · Tether WDK Edition ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}"
echo ""

# ─── Prerequisites ───────────────────────────────────────────────────────────
head "1 / 4  Checking prerequisites"

# Node.js ≥ 20
if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Install Node.js 20+ from https://nodejs.org"
  exit 1
fi
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  err "Node.js 20+ is required (found v${NODE_VERSION})."
  exit 1
fi
ok "Node.js v${NODE_VERSION}"

# pnpm
if ! command -v pnpm &>/dev/null; then
  warn "pnpm not found — installing globally via npm..."
  npm install -g pnpm
fi
PNPM_VERSION=$(pnpm --version)
ok "pnpm v${PNPM_VERSION}"

# git (optional — just warn)
if ! command -v git &>/dev/null; then
  warn "git not found — version info will be unavailable."
fi

# ─── Environment file ────────────────────────────────────────────────────────
head "2 / 4  Setting up environment"

if [ ! -f ".env" ]; then
  cp .env.example .env
  ok "Created .env from .env.example"
  info "Edit .env to set CAISHEN_NETWORK, API keys, and RPC overrides."
else
  ok ".env already exists — skipping (no overwrite)"
fi

# ─── Dependencies ────────────────────────────────────────────────────────────
head "3 / 4  Installing dependencies"

info "Running pnpm install..."
pnpm install
ok "Dependencies installed"

# ─── Build ──────────────────────────────────────────────────────────────────
if [ "$DO_BUILD" = true ]; then
  head "4 / 4  Building all packages"
  info "Running pnpm -r build..."
  pnpm -r build
  ok "All packages built successfully"
else
  head "4 / 4  Build skipped (--no-build)"
  warn "Run 'pnpm -r build' manually before using the CLI."
fi

# ─── Dev provisioning (--dev only) ──────────────────────────────────────────
if [ "$DO_PROVISION" = true ]; then
  echo ""
  echo -e "${BOLD}${CYAN}  ⬡  Dev provisioning${RESET}"
  info "Running 'caishen provision --mode wdk-local'..."

  if command -v caishen &>/dev/null; then
    caishen provision --mode wdk-local
    ok "Wallet provisioned at ~/.caishen/wallet.json"
  else
    # Fall back to pnpm exec in monorepo context
    if pnpm --filter @caishen/cli exec caishen provision --mode wdk-local 2>/dev/null; then
      ok "Wallet provisioned via pnpm --filter @caishen/cli exec"
    else
      warn "Could not run 'caishen provision' — install the CLI globally first:"
      warn "  npm install -g @caishen/cli"
      warn "Then run: caishen provision --mode wdk-local"
    fi
  fi
fi

# ─── Done ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ✔  Caishen is ready!${RESET}"
echo ""
echo -e "${BOLD}Next steps:${RESET}"
echo ""
echo -e "  ${CYAN}1.${RESET} Provision your wallet (if you haven't already):"
echo -e "       ${BOLD}pnpm caishen provision --mode wdk-local${RESET}"
echo ""
echo -e "  ${CYAN}2.${RESET} Check wallet status:"
echo -e "       ${BOLD}pnpm caishen status${RESET}"
echo ""
echo -e "  ${CYAN}3.${RESET} Verify WDK connectivity:"
echo -e "       ${BOLD}pnpm caishen verify-wdk --token USDT --amount 1${RESET}"
echo ""
echo -e "  ${CYAN}4.${RESET} Run the demo agent:"
echo -e "       ${BOLD}pnpm --filter @caishen/demo-agent start${RESET}"
echo ""
echo -e "  ${CYAN}5.${RESET} Watch live activity logs:"
echo -e "       ${BOLD}pnpm caishen logs --follow${RESET}"
echo ""
echo -e "  ${CYAN}Network switching:${RESET} set ${BOLD}CAISHEN_NETWORK=testnet${RESET} in .env to use"
echo -e "  Sepolia / TRON Nile / Solana Devnet / BTC testnet automatically."
echo ""
echo -e "  ${CYAN}Docs:${RESET} README.md  ·  POLICY.md  ·  SECURITY.md  ·  TETHER.md"
echo ""
