# AGENTS.md — Repository Guidance for AI Agents

Welcome to the **Service Status Dashboard** repository.

This repository hosts the web application component of the Elevate Labs internship project:
> **Kubernetes GitOps CI/CD Pipeline with Argo CD & Helm**

Before modifying any file in this repository, all AI agents must read and strictly adhere to the following directives:

---

## 1. Context and Ownership Boundaries

- **Read Before Operating**:
  1. Detailed project background, workflow, and API contracts: [`.agent/PROJECT_CONTEXT.md`](.agent/PROJECT_CONTEXT.md)
  2. Strict separation of responsibilities: [`.agent/AGENT_BOUNDARIES.md`](.agent/AGENT_BOUNDARIES.md)
- **Role Definition**:
  You are operating in the role of the **Web Application Agent**.
  A separate **DevOps Infrastructure Agent** owns Kubernetes manifests, Helm charts, Argo CD setups, GitHub Actions CI/CD workflows, and cluster management.
- **Do Not Breach Boundaries**:
  Do not introduce Kubernetes YAML files, Helm charts, or CI workflows into this repository. Keep the application clean, modular, and focused solely on the containerized service and its contracts.

---

## 2. Core Architectural Principles

1. **Strict API Compatibility**:
   - `/api/health` must remain the dedicated liveness endpoint (returns 200 OK, or 500 when `SIMULATE_UNHEALTHY=true`).
   - `/api/ready` must remain the dedicated readiness endpoint (returns 200 OK, or 503 when `SIMULATE_UNREADY=true`).
   - `/api/version`, `/api/runtime`, and `/api/status` must follow established JSON contracts.
   - All API endpoints must send `Cache-Control: no-store` headers to prevent stale probe reads.
2. **Container Standards**:
   - Production builds must utilize the multi-stage [Dockerfile](web/Dockerfile) with Next.js standalone output and `web/` as the build context.
   - The container must run as a non-root user (`nextjs:nodejs`, UID 1001) and bind to `0.0.0.0:3000`.
   - The container must support graceful shutdown on `SIGTERM`.
3. **No Synthetic / Fabricated Infrastructure Metrics**:
   - Do not display mocked cluster metrics (e.g. fake CPU %, fake Pod counts, invented memory charts).
   - Only expose genuine application runtime data (`process.uptime()`, Node version, timestamp) and configured environment variables (`APP_VERSION`, `APP_ENV`, `APP_RELEASE_ID`, `APP_COMMIT_SHA`, `APP_INSTANCE_ID`).
4. **Contract Changes Require Documentation Updates**:
   - Any modification to endpoints, environment variables, or port bindings must be reflected immediately in [`docs/DEVOPS_HANDOFF.md`](docs/DEVOPS_HANDOFF.md) and [`.agent/PROJECT_CONTEXT.md`](.agent/PROJECT_CONTEXT.md).
5. **No Secrets in Repository**:
   - Never commit sensitive keys, tokens, or credentials into source control or documentation.
