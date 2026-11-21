# Service Status Dashboard

> **GitOps Test Workload for Kubernetes CI/CD with Argo CD & Helm**  
> Part of the Elevate Labs DevOps Internship Project

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729B1B?style=flat&logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ed?style=flat&logo=docker)](https://www.docker.com/)

---

## 1. Project Overview

The **Service Status Dashboard** is an internal engineering telemetry and health-check web application built using Next.js App Router and TypeScript.

The application serves as the primary verifiable test workload for an automated **Kubernetes GitOps continuous delivery pipeline** orchestrated by **Argo CD** and **Helm**.

The Next.js app, its tests, and its Dockerfile live in [`web/`](web/). The project-level documentation and agent guidance live at the repository root.

---

## 2. Why This Application Exists

In a production GitOps workflow, infrastructure agents need a reliable, observable application to validate every automated step:
1. **Containerized Workload**: Provides an authentic web service container for scheduling on Kubernetes / K3s clusters.
2. **Release Observability**: Surfaces clear version numbers, commit hashes, release identifiers, and deployment environment labels so developers and reviewers can immediately verify when a Git commit triggers a live deployment sync.
3. **Probe Compliance**: Implements dedicated HTTP liveness (`/api/health`) and readiness (`/api/ready`) endpoints that strictly conform to Kubernetes probe expectations.
4. **Controlled Chaos & Failure Testing**: Provides environment-flagged failure simulation to prove that Kubernetes stops routing traffic to unready pods (HTTP 503) or restarts failing pods (HTTP 500) without crashing the server host.
5. **Config Drift & Rollback Demos**: Displays visual badges and runtime metadata to demonstrate automated state reconciliation and instant version rollbacks.

---

## 3. Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) component conventions
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: Dark and Light mode powered by `next-themes`
- **Validation**: [Zod](https://zod.dev/) for environment and configuration validation
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
- **Containerization**: Multi-stage OCI Docker image with standalone Node.js runner and non-root user

---

## 4. Local Development Setup

### Prerequisites
- Node.js `20.x`, `22.x`, or newer LTS
- npm `10.x` or newer

### Installation & Run

1. **Clone the repository and enter the application directory**:
   ```bash
   git clone <repo-url> service-status-dashboard
   cd service-status-dashboard/web
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Configure local environment**:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 5. Environment Configuration

All deployment metadata is parsed dynamically at runtime. Modifying environment variables does **not** require rebuilding the application container.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | `3000` | Port the HTTP server binds to |
| `HOSTNAME` | `0.0.0.0` | Network interface to bind |
| `APP_VERSION` | `1.0.0` | Semantic version string displayed across UI & API |
| `APP_ENV` | `development` | Deployment environment label (`development`, `staging`, `production`) |
| `APP_RELEASE_ID` | `local-dev` | Release tag (e.g. `rel-2026.11.20-1`) |
| `APP_COMMIT_SHA` | `local` | Git commit SHA (e.g. `7f83b2a`) |
| `APP_BUILD_TIME` | `null` | ISO 8601 build timestamp |
| `APP_INSTANCE_ID` | `local` | Pod hostname or instance identifier (e.g. `$HOSTNAME`) |
| `SIMULATE_UNREADY` | `false` | When `true`, `/api/ready` returns HTTP 503 |
| `SIMULATE_UNHEALTHY`| `false` | When `true`, `/api/health` returns HTTP 500 |

---

## 6. API Reference

All API routes emit `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`.

### 1. `GET /api/health` (Liveness Probe)
Checks if the application process is alive.

- **Status Code**: `200 OK` (or `500 Internal Server Error` if `SIMULATE_UNHEALTHY=true`)
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "service-status-dashboard"
  }
  ```

### 2. `GET /api/ready` (Readiness Probe)
Checks if the application is ready to accept incoming user traffic.

- **Status Code**: `200 OK` (or `503 Service Unavailable` if `SIMULATE_UNREADY=true`)
- **Response**:
  ```json
  {
    "status": "ready",
    "service": "service-status-dashboard"
  }
  ```

### 3. `GET /api/version`
Returns release coordinates and version identification.

- **Status Code**: `200 OK`
- **Response**:
  ```json
  {
    "name": "service-status-dashboard",
    "version": "1.0.0",
    "environment": "development",
    "commitSha": "local",
    "releaseId": "local-dev",
    "buildTime": null
  }
  ```

### 4. `GET /api/runtime`
Returns authentic Node.js process runtime telemetry.

- **Status Code**: `200 OK`
- **Response**:
  ```json
  {
    "status": "running",
    "nodeVersion": "v22.0.0",
    "uptimeSeconds": 142,
    "startedAt": "2026-11-20T10:00:00.000Z",
    "timestamp": "2026-11-20T10:02:22.000Z",
    "instanceId": "local"
  }
  ```

### 5. `GET /api/status`
Combined aggregated payload used for dashboard polling.

- **Status Code**: `200 OK` (or `500` if unhealthy, `503` if unready)
- **Response**:
  ```json
  {
    "service": "service-status-dashboard",
    "version": { ... },
    "runtime": { ... },
    "health": { "status": "healthy", "service": "service-status-dashboard" },
    "ready": { "status": "ready", "service": "service-status-dashboard" },
    "timestamp": "2026-11-20T10:02:22.000Z"
  }
  ```

---

## 7. Docker Build & Run Commands

The multi-stage [Dockerfile](web/Dockerfile) generates a standalone Next.js build using `web/` as its build context.

### 1. Build the Docker Image

Run from the repository root.

```bash
docker build -t service-status-dashboard:1.0.0 ./web
```

### 2. Run the Container
```bash
docker run -d \
  --name status-dashboard \
  -p 3000:3000 \
  -e APP_VERSION="1.0.0" \
  -e APP_ENV="production" \
  -e APP_RELEASE_ID="rel-prod-01" \
  -e APP_COMMIT_SHA="abc1234" \
  service-status-dashboard:1.0.0
```

### 3. Verify Container Health
```bash
curl -i http://localhost:3000/api/health
```

---

## 8. Release Version Demonstration

To demonstrate GitOps version upgrades (e.g., verifying an Argo CD rollout from `v1.0.0` to `v1.1.0` or `v2.0.0`):

1. **Start version 1.0.0**:
   ```bash
   docker run -d -p 3000:3000 -e APP_VERSION="1.0.0" -e APP_RELEASE_ID="baseline-v1" --name app-v1 service-status-dashboard:1.0.0
   ```
   *Dashboard visual*: Displays `v1.0.0` with release tag `baseline-v1` in the header and release identity bar.

2. **Deploy version 1.1.0**:
   ```bash
   docker run -d -p 3001:3000 -e APP_VERSION="1.1.0" -e APP_RELEASE_ID="feature-v1.1" --name app-v1-1 service-status-dashboard:1.0.0
   ```
   *Dashboard visual*: Instantly reflects `v1.1.0` and `feature-v1.1` across the topbar and release coordinates.

3. **Deploy major version 2.0.0**:
   ```bash
   docker run -d -p 3002:3000 -e APP_VERSION="2.0.0" -e APP_RELEASE_ID="major-upgrade-v2" --name app-v2 service-status-dashboard:1.0.0
   ```
   *Dashboard visual*: Displays `v2.0.0` with `major-upgrade-v2` release metadata without rebuilding the image.

---

## 9. Failure Simulation Examples

The application provides safe, environment-controlled failure simulation for DevOps testing:

### 1. Simulate Readiness Failure (HTTP 503)
Simulates a container that is alive but saturated or warming up:
```bash
docker run -d -p 3000:3000 -e SIMULATE_UNREADY="true" service-status-dashboard:1.0.0
```
- Endpoint `/api/ready` returns `HTTP 503`.
- **Kubernetes Behavior**: The Kubernetes Endpoints Controller removes the Pod from Service routing, protecting active user traffic.

### 2. Simulate Liveness Failure (HTTP 500)
Simulates internal deadlock or unrecoverable error:
```bash
docker run -d -p 3000:3000 -e SIMULATE_UNHEALTHY="true" service-status-dashboard:1.0.0
```
- Endpoint `/api/health` returns `HTTP 500`.
- **Kubernetes Behavior**: Kubelet restarts the container after `failureThreshold` consecutive failures.

---

## 10. Automated Testing & Verification

Run these checks from `web/`:
```bash
# Run all unit and integration tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Run ESLint validation
npm run lint

# Build production standalone bundle
npm run build
```

---

## 11. Relationship with Kubernetes & Argo CD

This application is designed specifically to interface with Kubernetes declarative resources:

```
[GitHub GitOps Repo] ──(Helm Chart values.yaml)──► [Argo CD Application Controller]
                                                               │
                                                               ▼ (Reconcile)
                                                    [K3s / Kubernetes Cluster]
                                                               │
                                                               ▼
                                              [Deployment / Pods (port 3000)]
                                                 ├── livenessProbe  -> /api/health
                                                 └── readinessProbe -> /api/ready
```

---

## 12. Responsibilities Reserved for the DevOps Agent

To maintain clean separation of concerns, the following tasks are **explicitly reserved** for the DevOps Infrastructure Agent:
- Provisioning the K3s / Kubernetes cluster.
- Authoring Helm charts (`Chart.yaml`, `templates/deployment.yaml`, `values.yaml`).
- Installing and configuring Argo CD applications and sync policies.
- Configuring GitHub Actions CI/CD workflows for building and pushing images to GHCR.
- Managing DNS, Ingress, and external load balancers.
- Designing Istio canary routing (planned for Phase 2).

For complete technical handoff specs, consult:
👉 [`docs/DEVOPS_HANDOFF.md`](docs/DEVOPS_HANDOFF.md)  
👉 [`.agent/PROJECT_CONTEXT.md`](.agent/PROJECT_CONTEXT.md)  
👉 [`.agent/AGENT_BOUNDARIES.md`](.agent/AGENT_BOUNDARIES.md)
