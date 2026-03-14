# Security Policy

## Supported Versions

Current development branch only (`1.x`).

## Reporting a Vulnerability

Please report security issues privately to project maintainers with:
- affected package(s)
- reproduction steps
- impact assessment

Do not disclose secrets, wallet seed material, or private keys in issue trackers.

## Security Notes

- Wallet secrets must never be committed to source control.
- `.env*` and local wallet runtime files are ignored by default.
- Activity logs are append-only JSONL and may contain operational metadata.
- Use `caishen policy pause` as an emergency stop for autonomous agents.
