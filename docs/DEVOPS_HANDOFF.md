# DevOps Handoff & Kubernetes Integration Contract

> **Target Audience**: DevOps Infrastructure Agent / Platform Engineer  
> **Application**: Service Status Dashboard  
> **Source Repository**: `service-status-dashboard`  
> **Status**: Ready for Containerization & Kubernetes Deployment  

This document provides the exact technical contracts, container parameters, and deployment recommendations necessary to deploy the **Service Status Dashboard** to Kubernetes via Helm and Argo CD without reverse-engineering the application codebase.

---

## 1. Container Specifications

| Specification | Value | Notes |
| :--- | :--- | :--- |
| **Base Image** | `node:22-alpine` | Multi-stage build with `libc6-compat` and `curl` |
| **Output Type** | Next.js Standalone | Minimal runtime bundle |
| **Internal Port** | `3000` | Process listens on `0.0.0.0:3000` |
| **Process User** | `nextjs` (UID `1001`, GID `1001`) | **Non-root user required**; no root privileges needed |
| **Startup Command** | `CMD ["node", "server.js"]` | Exec-form ensures signals (`SIGTERM`, `SIGINT`) reach Node.js |
| **Signal Handling** | Graceful shutdown supported | Process handles `SIGTERM` within termination grace period |
| **Filesystem Access** | Read-only with ephemeral cache | Requires write permission only on `/app/.next/cache` (handled in Dockerfile) |

### 1.1 OCI Image Build Command

Run from the repository root. The build uses [`web/Dockerfile`](../web/Dockerfile) and `web/` as its context.

```bash
docker build -t service-status-dashboard:1.0.0 ./web
```

### 1.2 Local Container Run Command
```bash
docker run -d \
  --name status-dashboard \
  -p 3000:3000 \
  -e APP_VERSION="1.0.0" \
  -e APP_ENV="development" \
  -e APP_RELEASE_ID="rel-dev-01" \
  service-status-dashboard:1.0.0
```

---

## 2. Environment Variables Configuration Contract

All application metadata is loaded **dynamically at runtime** from environment variables on the server. Changing these values via Kubernetes `ConfigMap` or `env` does **not** require rebuilding the container image.

| Environment Variable | Required | Default | Recommended Kubernetes Source | Description |
| :--- | :---: | :---: | :--- | :--- |
| `NODE_ENV` | No | `production` | Literal `production` | Node.js execution mode |
| `PORT` | No | `3000` | Literal `3000` | TCP port to bind |
| `HOSTNAME` | No | `0.0.0.0` | Literal `0.0.0.0` | Bind IP interface |
| `APP_VERSION` | No | `1.0.0` | Helm value `.Chart.AppVersion` | Semantic version string displayed on UI/API |
| `APP_ENV` | No | `development` | Helm value `.Values.environment` | Target environment label (`staging`, `production`) |
| `APP_RELEASE_ID` | No | `local-dev` | Helm value `.Release.Name` | Unique deployment/release identifier |
| `APP_COMMIT_SHA` | No | `local` | CI build parameter (e.g. `$GITHUB_SHA`) | Git commit hash of the deployed release |
| `APP_BUILD_TIME` | No | `null` | CI build parameter (e.g. `$(date -u +%FT%TZ)`) | ISO 8601 build timestamp |
| `APP_INSTANCE_ID` | No | `local` | Pod name via Downward API | Identifier of the specific running Pod instance |
| `SIMULATE_UNREADY` | No | `false` | Literal `false` | When `true`, `/api/ready` returns HTTP 503 |
| `SIMULATE_UNHEALTHY`| No | `false` | Literal `false` | When `true`, `/api/health` returns HTTP 500 |

### 2.1 Recommended Kubernetes Pod Env Injection

```yaml
env:
  - name: NODE_ENV
    value: "production"
  - name: PORT
    value: "3000"
  - name: HOSTNAME
    value: "0.0.0.0"
  - name: APP_VERSION
    value: "{{ .Values.app.version }}"
  - name: APP_ENV
    value: "{{ .Values.environment }}"
  - name: APP_RELEASE_ID
    value: "{{ .Release.Name }}-{{ .Release.Revision }}"
  - name: APP_COMMIT_SHA
    value: "{{ .Values.app.commitSha }}"
  - name: APP_BUILD_TIME
    value: "{{ .Values.app.buildTime }}"
  - name: APP_INSTANCE_ID
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
  - name: SIMULATE_UNREADY
    value: "{{ .Values.simulation.simulateUnready | default false | quote }}"
  - name: SIMULATE_UNHEALTHY
    value: "{{ .Values.simulation.simulateUnhealthy | default false | quote }}"
```

---

## 3. HTTP Endpoints Contract & Probes

All API routes return `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`.

### 3.1 Liveness Probe Endpoint: `GET /api/health`
- **Healthy Response**: HTTP 200 OK
  ```json
  {
    "status": "healthy",
    "service": "service-status-dashboard"
  }
  ```
- **Simulated Failure (`SIMULATE_UNHEALTHY=true`)**: HTTP 500 Internal Server Error
  ```json
  {
    "status": "unhealthy",
    "service": "service-status-dashboard"
  }
  ```
- **Recommended Kubernetes Liveness Probe**:
  ```yaml
  livenessProbe:
    httpGet:
      path: /api/health
      port: 3000
    initialDelaySeconds: 5
    periodSeconds: 10
    timeoutSeconds: 2
    failureThreshold: 3
  ```

### 3.2 Readiness Probe Endpoint: `GET /api/ready`
- **Ready Response**: HTTP 200 OK
  ```json
  {
    "status": "ready",
    "service": "service-status-dashboard"
  }
  ```
- **Simulated Failure (`SIMULATE_UNREADY=true`)**: HTTP 503 Service Unavailable
  ```json
  {
    "status": "unready",
    "service": "service-status-dashboard"
  }
  ```
- **Recommended Kubernetes Readiness Probe**:
  ```yaml
  readinessProbe:
    httpGet:
      path: /api/ready
      port: 3000
    initialDelaySeconds: 3
    periodSeconds: 5
    timeoutSeconds: 2
    failureThreshold: 2
  ```

### 3.3 Telemetry & Status Endpoints
- **`GET /api/version`**: Returns `{ name, version, environment, commitSha, releaseId, buildTime }` (HTTP 200).
- **`GET /api/runtime`**: Returns `{ status, nodeVersion, uptimeSeconds, startedAt, timestamp, instanceId }` (HTTP 200).
- **`GET /api/status`**: Combined status object for dashboard polling (HTTP 200, 500 if unhealthy, 503 if unready).
- **`GET /`**: HTML Web Dashboard.

---

## 4. Kubernetes Service & Networking Recommendations

- **Service Type**: `ClusterIP` (internal) or `NodePort` / `LoadBalancer` / Ingress.
- **Port Mapping**:
  ```yaml
  ports:
    - name: http
      port: 80
      targetPort: 3000
      protocol: TCP
  ```
- **Security Context**:
  ```yaml
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    allowPrivilegeEscalation: false
    capabilities:
      drop:
        - ALL
    readOnlyRootFilesystem: false
  ```

---

## 5. Failure Simulation Demonstrations

The DevOps Agent can run these chaos scenarios to validate GitOps recovery, self-healing, and rollout controls:

### Scenario A: Zero-Downtime Rollout Protection (Readiness Failure)
1. Deploy new version with `SIMULATE_UNREADY="true"`.
2. Kubernetes Readiness Probe fails (`HTTP 503`).
3. Kubernetes does not route traffic to the new Pod; old Pods continue serving.
4. Argo CD marks the application as progressing or degraded, halting rollout.

### Scenario B: Self-Healing Pod Restart (Liveness Failure)
1. Enable `SIMULATE_UNHEALTHY="true"`.
2. Kubernetes Liveness Probe fails (`HTTP 500`) for 3 consecutive checks.
3. Kubelet restarts the container, incrementing the restart counter.

---

## 6. What the DevOps Agent Needs to Implement Next

1. **Helm Chart Scaffolding**: Create `charts/service-status-dashboard/` with templates for Deployment, Service, and ConfigMap.
2. **K3s / Cluster Setup**: Provision a local or remote K3s cluster.
3. **Argo CD Application Manifest**: Configure an Argo CD `Application` CRD tracking the GitOps deployment repository.
4. **GitHub Actions CI Pipeline**: Build and publish versioned OCI images to GitHub Container Registry (GHCR).
5. **GitOps Sync & Rollback Validation**: Test automated deployment triggers, configuration drift repair, and instant version rollback.
