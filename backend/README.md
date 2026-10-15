# OpsCopilot — Backend Agent Engine

This directory contains the Express backend service for **OpsCopilot**, integrating **Nebius Token Factory** and **NVIDIA Nemotron** models for autonomous SRE diagnostics.

## Architecture

- `src/services/nebiusService.js`: Secure gateway to Nebius Token Factory (`nvidia/nemotron-3-ultra` and `nvidia/nemotron-4-340b-instruct`).
- `src/services/sandboxService.js`: Isolated sandbox runner for safety assertions and virtual remediation execution.
- `src/services/alertService.js`: Slack Block Kit & MS Teams Adaptive Card generator.
- `src/config/db.js`: SQLite storage with WAL journaling mode.
- `src/middleware/rateLimiter.js`: API rate limiting to safeguard provider quotas.

## Getting Started

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your `NEBIUS_API_KEY` (optional for local demo).
3. Run the development server:
   ```bash
   npm install
   npm run dev
   ```
4. Health check:
   ```bash
   curl http://localhost:5000/api/health
   ```
