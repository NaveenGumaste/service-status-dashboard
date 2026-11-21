# Agent Boundaries & Responsibility Matrix

## 1. Purpose of This Document

This document establishes the explicit division of responsibilities between the **Web Application Agent** and the **DevOps Infrastructure Agent** within the Elevate Labs internship project: *Kubernetes GitOps CI/CD Pipeline with Argo CD & Helm*.

Clear boundaries prevent scope creep, protect GitOps architectural separation of concerns, and ensure that both agents produce modular, production-standard deliverables.

---

## 2. Responsibility Matrix

| Area / Component | Web Application Agent (This Repo) | DevOps Infrastructure Agent |
| :--- | :---: | :---: |
| **Next.js Application Code** (App Router, React, Tailwind CSS) | ✅ **OWNER** | ❌ Out of scope |
| **User Interface & UX** (Status Dashboard, Themes, Badges) | ✅ **OWNER** | ❌ Out of scope |
| **HTTP API Endpoints** (`/api/health`, `/api/ready`, `/api/status`, etc.) | ✅ **OWNER** | ❌ Out of scope |
| **Runtime Metadata & Env Parsing** (Zod validation, process uptime) | ✅ **OWNER** | ❌ Out of scope |
| **Failure Simulation Logic** (`SIMULATE_UNHEALTHY`, `SIMULATE_UNREADY`) | ✅ **OWNER** | ❌ Out of scope |
| **Containerization** (Multi-stage Dockerfile, `.dockerignore`) | ✅ **OWNER** | ❌ Out of scope |
| **Application Tests** (Vitest, React Testing Library, API tests) | ✅ **OWNER** | ❌ Out of scope |
| **Application & Handoff Docs** (`README.md`, `docs/DEVOPS_HANDOFF.md`) | ✅ **OWNER** | ❌ Out of scope |
| **Kubernetes Infrastructure** (K3s, Nodes, Namespaces) | ❌ Out of scope | ✅ **OWNER** |
| **Kubernetes Manifests** (Deployments, Services, Ingress, ConfigMaps) | ❌ Out of scope | ✅ **OWNER** |
| **Helm Charts** (Chart.yaml, values.yaml, templates) | ❌ Out of scope | ✅ **OWNER** |
| **Argo CD Setup & Applications** (Application CRD, Project CRD) | ❌ Out of scope | ✅ **OWNER** |
| **GitOps Repository Setup** (Config repo synchronization) | ❌ Out of scope | ✅ **OWNER** |
| **CI/CD Automation** (GitHub Actions workflows, Docker build & push to GHCR) | ❌ Out of scope | ✅ **OWNER** |
| **Container Registry Management** (GHCR permissions, tags, secret scanning) | ❌ Out of scope | ✅ **OWNER** |
| **Cluster Monitoring & Observability** (Prometheus, Grafana, cluster alerts) | ❌ Out of scope | ✅ **OWNER** |
| **Rollback & Drift Remediation Procedures** (Argo CD sync policies) | ❌ Out of scope | ✅ **OWNER** |
| **Service Mesh / Istio Integration** (Future canary routing) | ❌ Out of scope | ✅ **OWNER** |

---

## 3. Strict Rules of Engagement

1. **No Infrastructure Artifacts in Application Repo**:
   The Web Application Agent must NOT generate Kubernetes YAML manifests, Helm charts, Argo CD manifests, or GitHub Actions workflow files inside this repository unless explicitly instructed.
2. **Contract-First Communication**:
   All communication between the Web Application and the Kubernetes infrastructure happens through the defined HTTP contracts (port `3000`, `/api/health`, `/api/ready`, `/api/version`, `/api/runtime`, `/api/status`) and environment variables documented in `docs/DEVOPS_HANDOFF.md`.
3. **No Fabricated Infrastructure Metrics**:
   The Web Application Agent must never present fake CPU usage, mock Pod counts, synthetic memory gauges, or simulated Kubernetes events. Only genuine Node.js runtime information (`process.uptime()`, `process.version`, current timestamp) and supplied environment variables are surfaced.
4. **Handoff Documentation Requirement**:
   Whenever an API signature, environment variable, port binding, or probe response changes, the Web Application Agent must immediately update `docs/DEVOPS_HANDOFF.md` and `.agent/PROJECT_CONTEXT.md`.
