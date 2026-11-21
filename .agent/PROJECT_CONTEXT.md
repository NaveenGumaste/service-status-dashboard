# Project Context: Service Status Dashboard

## 1. Overall Project Overview

The **Service Status Dashboard** is a lightweight, production-ready, containerized web application designed and built as the primary test workload for the Elevate Labs internship project:

> **Kubernetes GitOps CI/CD Pipeline with Argo CD & Helm**

The core objective of the internship project is to implement an automated GitOps delivery workflow where the desired state of Kubernetes workloads is declared in Git and synchronized automatically to the cluster.

The Next.js app and its Dockerfile live in `web/`. Run npm commands from `web/` and use `web/` as the Docker build context.

The target infrastructure architecture planned by the DevOps team comprises:
- **Kubernetes / K3s**: Container orchestration platform.
- **Argo CD**: Declarative GitOps continuous delivery tool.
- **Helm**: Kubernetes package management for application templating and release management.
- **Docker**: OCI containerization engine.
- **GitHub Actions**: Continuous Integration pipeline runner.
- **GitHub Container Registry (GHCR)**: OCI artifact registry for versioned container images.
- **GitHub**: Canonical source of truth for both application source code and GitOps deployment configurations.

---

## 2. Why This Application Exists

This application serves as the verifiable workload for validating every stage of the GitOps pipeline:
1. **Containerized Workload**: Provides an authentic, self-contained microservice container for Kubernetes scheduling.
2. **Release Observability**: Clearly surfaces version, commit SHA, release ID, and environment in the UI so human reviewers and automated tests can immediately confirm whether a newly deployed release has taken effect.
3. **Probe Target**: Exposes distinct liveness (`/api/health`) and readiness (`/api/ready`) endpoints that match Kubernetes probe semantics.
4. **Controlled Failure Testing**: Allows DevOps engineers to simulate pod readiness failures (HTTP 503) and liveness failures (HTTP 500) via environment variables to demonstrate how Kubernetes and Argo CD detect unready pods, halt rollouts, or trigger pod restarts.
5. **Config Drift & Rollback Demonstrations**: Provides unambiguous visual and API cues to prove successful automated sync, drift remediation, and instant rollback.

---

## 3. Planned Delivery Workflow

The envisioned end-to-end delivery lifecycle operates as follows:

```
[Developer Code Commit]
         │
         ▼
[1. GitHub Actions CI] ───► Runs Tests & Linting
         │
         ▼
[2. Docker Build & Push] ───► Pushes image: `ghcr.io/.../service-status-dashboard:vX.Y.Z`
         │
         ▼
[3. GitOps PR / Commit] ───► Updates image tag in Helm values / GitOps repo
         │
         ▼
[4. Argo CD Reconcile] ───► Detects Git change & synchronizes with K3s
         │
         ▼
[5. Kubernetes Rollout] ───► Deploys new Pods, evaluates Readiness & Liveness
         │
         ▼
[6. Verification] ───► Dashboard UI & API reflect new version and healthy status
```

> **Note on Implementation Status**: Steps 2 through 6 above represent the **intended target integration workflow** managed by the DevOps Agent. Within the application repository, only step 1 (application tests, container buildability, and runtime contracts) is implemented. The external CI/CD triggers, Argo CD configurations, and Kubernetes cluster resources are owned and provisioned by the separate DevOps Agent.

---

## 4. Application Contract & Specifications

### 4.1 HTTP Routes

| Endpoint | Method | Purpose | Healthy Response | Status Code | Error Code / Failure Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Dashboard UI | HTML Document | 200 | 500 on server error |
| `/api/health` | `GET` | Liveness check | `{"status":"healthy","service":"service-status-dashboard"}` | 200 | 500 when `SIMULATE_UNHEALTHY=true` |
| `/api/ready` | `GET` | Readiness check | `{"status":"ready","service":"service-status-dashboard"}` | 200 | 503 when `SIMULATE_UNREADY=true` |
| `/api/version` | `GET` | Version metadata | `{"name":...,"version":...,"environment":...,"commitSha":...,"releaseId":...,"buildTime":...}` | 200 | 500 on configuration failure |
| `/api/runtime` | `GET` | Safe runtime info | `{"status":"running","nodeVersion":...,"uptimeSeconds":...,"startedAt":...,"timestamp":...,"instanceId":...}` | 200 | 500 on server error |
| `/api/status` | `GET` | Aggregated status | Combined object with health, ready, version, and runtime info | 200 | 500 on server error |

### 4.2 Cache-Control
All `/api/*` endpoints strictly return `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate` to ensure Kubernetes probes and dashboard polling queries always receive authoritative real-time state.

### 4.3 Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `development` | Node runtime environment (`development`, `production`, `test`) |
| `PORT` | Number | `3000` | HTTP port the server binds to |
| `HOSTNAME` | String | `0.0.0.0` | Network interface to bind (required for containers) |
| `APP_VERSION` | String | `1.0.0` | Semantic version string displayed on UI and API |
| `APP_ENV` | String | `development` | Deployment environment label (`development`, `staging`, `production`) |
| `APP_RELEASE_ID` | String | `local-dev` | Unique release tag or identifier (e.g. `rel-2026.11.20-1`) |
| `APP_COMMIT_SHA` | String | `local` | Git commit SHA (e.g. `7f83b2a` or full SHA) |
| `APP_BUILD_TIME` | String | `null` (empty) | ISO 8601 build timestamp string |
| `APP_INSTANCE_ID` | String | `local` | Pod hostname or instance identifier (e.g. `$HOSTNAME` in Kubernetes) |
| `SIMULATE_UNREADY` | Boolean | `false` | When `true`, `/api/ready` returns HTTP 503 |
| `SIMULATE_UNHEALTHY`| Boolean | `false` | When `true`, `/api/health` returns HTTP 500 |

### 4.4 Dynamic Runtime Resolution
Deployment metadata (`APP_VERSION`, `APP_ENV`, `APP_RELEASE_ID`, `APP_COMMIT_SHA`, `APP_INSTANCE_ID`) is parsed on the server at runtime. Changing environment variables when running a container (or via Kubernetes `env` / `ConfigMap`) instantly reflects in the application without requiring a rebuild of the Docker image.

### 4.5 Container Lifecycle & Process Behavior
- **Container Port**: Default `3000`, bound to `0.0.0.0`.
- **Runtime User**: Non-root user `nextjs` (UID 1001, GID 1001).
- **Execution**: Node.js standalone server launched with exec-form `CMD ["node", "server.js"]`.
- **Signal Handling**: Listens for `SIGTERM` and `SIGINT` to allow graceful connection draining within Kubernetes termination grace periods.

---

## 5. Kubernetes Integration Requirements

When defining Kubernetes resources, the DevOps Agent should apply the following specs:

1. **Deployment & Pod Spec**:
   - Container port: `3000`.
   - Mount pod name into `APP_INSTANCE_ID` using Kubernetes downward API:
     ```yaml
     - name: APP_INSTANCE_ID
       valueFrom:
         fieldRef:
           fieldPath: metadata.name
     ```
2. **Probes**:
   - **Liveness Probe**:
     ```yaml
     livenessProbe:
       httpGet:
         path: /api/health
         port: 3000
       initialDelaySeconds: 5
       periodSeconds: 10
       failureThreshold: 3
     ```
   - **Readiness Probe**:
     ```yaml
     readinessProbe:
       httpGet:
         path: /api/ready
         port: 3000
       initialDelaySeconds: 3
       periodSeconds: 5
       failureThreshold: 2
     ```
3. **Service**:
   - ClusterIP or NodePort targeting port `3000`.

---

## 6. Future Extension: Canary Releases (Istio)

A subsequent phase of the internship project plans to introduce **Istio Service Mesh** for canary deployment strategies (e.g., routing 10% traffic to `v1.1.0-canary` and 90% to `v1.0.0-stable`).

To ensure total compatibility:
- The application is stateless and does not maintain in-memory sessions that would prevent multiple concurrent versions from serving traffic simultaneously.
- Release versioning is prominent in the UI header and status cards, enabling clear visual verification of canary traffic splits in the browser.
- No Istio-specific CRDs or proxies are packaged inside this application repository.
