# AI AGENT TASK — Build a GitOps-Ready Service Status Dashboard

## ROLE

You are a Senior Full-Stack Engineer specializing in Next.js, TypeScript, application architecture, Docker, API design, testing, and production-ready frontend development.

Your responsibility is to design and implement a complete, visually polished, lightweight, container-ready web application called **Service Status Dashboard**.

This application is part of a larger DevOps internship project titled:

**Kubernetes GitOps CI/CD Pipeline with Argo CD & Helm**

IMPORTANT: You are the **Web Application Agent**, not the DevOps Infrastructure Agent.

A separate AI agent will guide the implementation of Kubernetes, K3s, Helm, Argo CD, GitHub Actions, GitOps synchronization, deployment rollback, and infrastructure configuration.

Build the application to support that project, but do not implement the external deployment infrastructure yourself.

---

# 1. PROJECT OBJECTIVE

Build a modern web application that can be deployed as a Docker container into a Kubernetes cluster.

The application will serve as the test workload for a GitOps delivery system.

It must provide:

- A professional web dashboard.
- Application runtime and version information.
- Health and readiness endpoints.
- Deployment-identifying metadata.
- Clearly distinguishable application releases.
- A controlled way to demonstrate application health failures.
- Configuration through environment variables.
- Proper container lifecycle behavior.
- Automated application tests.
- Production-quality documentation.

The application should be functional independently of Kubernetes, using local development or Docker.

The primary objective is not to create a complex business application. It is to create a dependable application that a separate DevOps agent can use to demonstrate and validate GitOps workflows.

---

# 2. TECHNOLOGY STACK

Use the following stack:

**Frontend and backend**

- Next.js with App Router
- TypeScript with strict mode enabled
- React
- Tailwind CSS
- shadcn/ui
- Lucide icons

**Application engineering**

- Zod for configuration validation where appropriate
- Vitest for unit and integration tests
- Docker with a multi-stage production build
- Node.js LTS version compatible with the selected Next.js release
- npm as the package manager

Use stable, supported dependency versions.

Follow Next.js App Router best practices.

Keep server-side environment information separate from client-side code.

No database is required.

Avoid unnecessary services, external APIs, OAuth, SaaS dependencies, and paid infrastructure.

---

# 3. APPLICATION DESIGN

Application name: **Service Status Dashboard**

Create a professional infrastructure operations dashboard.

Visual direction:

- Modern SaaS monitoring dashboard.
- Dark and light themes.
- Neutral slate, charcoal, and white surfaces.
- Restrained blue or emerald accents.
- Excellent typography and spacing.
- Subtle transitions and micro-interactions.
- Responsive desktop and mobile layouts.
- Accessible color contrast.
- Skeleton states where appropriate.
- Reusable, maintainable UI components.

Avoid excessive animation, unnecessary complexity, and decorative features that don't serve the application's purpose.

The interface should look like a genuine internal engineering tool rather than a generic tutorial application.

## Main dashboard

Create a dashboard containing:

### A. Application overview

Display:

- Application name
- Application version
- Deployment environment
- Release identifier
- Git commit SHA when supplied
- Build timestamp when supplied
- Application uptime
- Current application health

### B. Runtime information

Display:

- Runtime type
- Node.js version
- Application start time
- Server-reported uptime
- Current server timestamp
- Instance identifier when supplied

Only display values from actual runtime data or configured environment variables.

Never invent infrastructure measurements.

### C. Deployment information

Display:

- Deployed version
- Build commit
- Environment
- Build date
- Deployment/instance identifier
- Health and readiness status

The dashboard must visibly distinguish v1.0.0 from v1.1.0 or v2.0.0.

Use an obvious version indicator that makes deployment demonstrations easy to observe.

### D. Health panel

Display:

- Liveness status
- Readiness status
- Last successful health check
- Last failed health check when applicable

Use actual API responses.

Handle timeouts, unexpected responses, and service errors gracefully.

### E. Release identity panel

Make changes between application versions visually obvious.

The version, commit, and release label should update based on configuration.

Do not hardcode deployment versions in UI components.

### F. Optional details

Include a compact technical-details section showing safe, non-sensitive runtime metadata.

Do not expose environment secrets, authentication credentials, Kubernetes tokens, or internal configuration values.

---

# 4. REQUIRED API ENDPOINTS

Implement the following HTTP endpoints using Next.js Route Handlers.

## GET /api/health

Purpose: Application liveness check.

Expected healthy response:

```json
{
  "status": "healthy",
  "service": "service-status-dashboard"
}
```

Return:

- HTTP 200 when the application is alive.
- HTTP 500 when a deliberately simulated liveness failure is enabled for testing.

Keep the liveness check independent of external dependencies.

Use dynamic runtime responses and prevent inappropriate caching.

## GET /api/ready

Purpose: Application readiness check.

Expected ready response:

```json
{
  "status": "ready",
  "service": "service-status-dashboard"
}
```

Return:

- HTTP 200 when ready to receive traffic.
- HTTP 503 when readiness is deliberately disabled.

Readiness should not depend on internet connectivity.

## GET /api/version

Return version and release metadata:

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

Build these fields from validated environment configuration.

## GET /api/runtime

Return safe application runtime information:

```json
{
  "status": "running",
  "nodeVersion": "runtime-generated",
  "uptimeSeconds": 120,
  "startedAt": "runtime-generated",
  "timestamp": "runtime-generated",
  "instanceId": "local"
}
```

Generate actual values at runtime.

Uptime must be measured from a clearly defined process or application start time.

## GET /api/status

Provide a combined dashboard-friendly response.

Include:

- Service name
- Application version
- Release ID
- Health
- Readiness
- Runtime information
- Timestamp

This endpoint can aggregate internal status functions without making unnecessary HTTP requests back to the same server.

Define TypeScript interfaces or Zod schemas for the response contracts.

---

# 5. ENVIRONMENT CONFIGURATION

Support these environment variables:

```env
NODE_ENV=development
APP_VERSION=1.0.0
APP_ENV=development
APP_RELEASE_ID=local-dev
APP_COMMIT_SHA=local
APP_BUILD_TIME=
APP_INSTANCE_ID=local
SIMULATE_UNREADY=false
SIMULATE_UNHEALTHY=false
```

Requirements:

- Provide `.env.example`.
- Validate configurable values.
- Provide safe defaults for local development.
- Document every variable.
- Read runtime configuration server-side.
- Avoid exposing private environment variables to the browser.
- Do not rely on `NEXT_PUBLIC_` variables for deployment metadata that should change at container startup.

Version and deployment metadata must be able to change without rebuilding the frontend, provided the backend's runtime environment variables are updated appropriately.

The UI should fetch the current metadata from server endpoints.

---

# 6. FAILURE SIMULATION

Add a controlled failure-simulation mechanism for DevOps testing.

Support:

- Readiness failure simulation.
- Liveness failure simulation.

These features must be disabled by default.

Use environment-variable-based configuration.

Do not expose a publicly accessible endpoint that allows arbitrary users to toggle infrastructure failures.

Readiness simulation should return HTTP 503 from `/api/ready`.

Liveness simulation should return HTTP 500 from `/api/health`.

Document the difference between these simulations and an actual process crash.

IMPORTANT: Do not implement infinite crash loops, destructive actions, or unsafe host-level operations.

---

# 7. CONTAINERIZATION

Create a production-ready Dockerfile.

Requirements:

- Multi-stage Docker build.
- Next.js standalone output.
- Small production image.
- Non-root runtime user.
- Clearly defined application port.
- Bind the server to `0.0.0.0`.
- Support graceful termination through SIGTERM.
- Use an exec-form container startup command.
- Include `.dockerignore`.
- Include an appropriate container health check, or document why Kubernetes probes will be used instead.

Ensure the application operates correctly inside Docker and does not require access to host-specific files.

Use a compatible Node.js base image and pinned major versions.

Do not embed secrets into Docker images.

---

# 8. TESTING

Implement meaningful automated tests.

Cover:

- Health endpoint response.
- Readiness endpoint response.
- Version metadata.
- Environment-variable defaults.
- Unhealthy and unready simulation.
- Runtime information response shape.
- Basic dashboard component rendering.

Provide scripts for:

- Development
- Build
- Production startup
- Linting
- Type checking
- Testing

Do not claim tests pass unless they have actually been run.

Ensure the production build succeeds before marking the task complete.

---

# 9. AGENT CONTEXT FILES — MANDATORY

Create this hidden directory:

`.agent/`

Inside it create:

1. `.agent/PROJECT_CONTEXT.md`
2. `.agent/AGENT_BOUNDARIES.md`

Also create a root-level `AGENTS.md`.

These files are essential for collaboration between the Web Application Agent and the separate DevOps Agent.

## .agent/PROJECT_CONTEXT.md

This document must explain:

### Overall project

The Service Status Dashboard is a supporting application for the Elevate Labs internship project:

**GitOps Workflow using ArgoCD on Kubernetes**

The internship objective is to implement GitOps by synchronizing Kubernetes deployment state directly from a Git repository.

The planned infrastructure technologies include:

- Kubernetes / K3s
- Argo CD
- Helm
- Docker
- GitHub Actions
- GitHub Container Registry
- GitHub as the source of truth

### Why this application exists

This application provides a containerized workload for demonstrating Kubernetes deployment automation, GitOps synchronization, release versioning, configuration drift remediation, and rollback.

### Planned delivery workflow

1. Developer updates application code.
2. CI runs application tests.
3. CI builds and publishes a versioned Docker image.
4. CI proposes an image-version update in the GitOps configuration repository.
5. The update is merged after approval.
6. Argo CD detects the GitOps configuration change.
7. Kubernetes reconciles the desired state.
8. Kubernetes deploys the corresponding application image.
9. Health and readiness checks verify application availability.
10. Deployment status can be inspected through Argo CD and Kubernetes.

Clarify that steps 2–10 represent the intended integration and must not be described as implemented until verified.

### Application contract

Document:

- All HTTP routes.
- Required environment variables.
- Response structures.
- Health and readiness semantics.
- Runtime port.
- Container image behavior.
- Startup and shutdown expectations.
- How deployment version changes are displayed.
- Failure simulation behavior.

### Integration requirements

The application must be suitable for Kubernetes Deployment and Service resources.

Its health endpoints must be compatible with Kubernetes HTTP probes.

Its version metadata must make releases observable.

Its runtime configuration must support separate development and production deployments.

### Future extension

A second internship project may add Istio-based canary deployment with stable and canary application versions.

Therefore, avoid design decisions that prevent multiple application versions from running simultaneously.

Do not implement Istio in the web application project.

## .agent/AGENT_BOUNDARIES.md

Document ownership clearly.

### Web Application Agent owns

- Next.js application
- UI and UX
- HTTP API endpoints
- Runtime metadata
- Environment configuration
- Dockerfile
- Application tests
- Application documentation

### DevOps Agent owns

- K3s cluster
- Kubernetes YAML manifests
- Helm charts
- Argo CD installation and Applications
- GitOps configuration repository
- GitHub Actions workflows
- Container registry integration
- Deployment automation
- Kubernetes monitoring
- Deployment rollback procedures
- Cluster and cloud infrastructure

The Web Application Agent may document requirements for the DevOps Agent but must not silently implement the DevOps Agent's responsibilities.

If an infrastructure-related change is needed, describe the requirement and record it in the agent context documentation.

## AGENTS.md

Create a concise repository-level instruction file that:

- Explains the repository purpose.
- Identifies this repository as the application side of a larger GitOps project.
- Directs AI agents to read `.agent/PROJECT_CONTEXT.md` and `.agent/AGENT_BOUNDARIES.md` before making changes.
- Emphasizes API compatibility and containerization.
- Prohibits unauthorized modifications to infrastructure ownership boundaries.
- Requires documentation updates when application contracts change.

Keep these context files in version control.

Do not place secrets inside them.

---

# 10. REQUIRED DOCUMENTATION

Create a comprehensive README containing:

- Project overview.
- Why the application exists.
- Technology stack.
- Local development setup.
- Environment configuration.
- API reference.
- Docker build and run commands.
- Health-check examples.
- Release-version demonstration.
- Failure-simulation examples.
- Test commands.
- Explanation of the relationship with Kubernetes and Argo CD.
- Responsibilities reserved for the separate DevOps Agent.

Create a concise integration document at:

`docs/DEVOPS_HANDOFF.md`

This handoff document should provide the DevOps Agent with everything needed to deploy the application without reverse-engineering its code.

Include the container port, endpoint contracts, required configuration, image build command, probe recommendations, and validation commands.

---

# 11. APPLICATION ARCHITECTURE

Use a clean, maintainable folder structure.

Suggested organization:

```text
src/
  app/
    api/
      health/
      ready/
      version/
      runtime/
      status/
    page.tsx
    layout.tsx
    globals.css
  components/
    dashboard/
    ui/
  lib/
    config/
    runtime/
    health/
  types/
tests/
docs/
.agent/
```

Use shared business logic where appropriate.

Avoid duplicating environment parsing or runtime calculations across route handlers.

Choose clear naming conventions.

Maintain strict TypeScript types.

---

# 12. OUT-OF-SCOPE ITEMS

Do not implement:

- Kubernetes cluster installation.
- Helm chart generation.
- Argo CD installation.
- GitOps repository automation.
- GitHub Actions deployment workflows.
- Terraform.
- Cloud infrastructure.
- Istio configuration.
- Complex authentication.
- Database infrastructure.
- External monitoring platforms.

These belong to the separate DevOps project.

Do not build a fake Kubernetes control panel.

Do not present fabricated CPU usage, Pod counts, cluster health, memory metrics, or deployment events.

The application may display its own real runtime metadata and configured release identifiers.

---

# 13. IMPLEMENTATION PROCESS

Follow this sequence:

**Phase 1 — Foundation**

- Initialize Next.js and TypeScript.
- Configure Tailwind and shadcn/ui.
- Create the project structure.
- Create all agent context files.

**Phase 2 — Application APIs**

- Implement environment configuration.
- Implement runtime metadata.
- Implement health/readiness endpoints.
- Implement version and status endpoints.

**Phase 3 — Dashboard UI**

- Build a polished, responsive dashboard.
- Fetch real backend information.
- Create reusable components.
- Handle loading, success, and failure states.
- Implement dark and light themes.

**Phase 4 — Docker**

- Configure standalone output.
- Create a production Dockerfile.
- Verify container startup.
- Verify runtime environment configuration.

**Phase 5 — Testing**

- Add automated tests.
- Run type checking and linting.
- Verify endpoint status codes.
- Verify Docker behavior.
- Fix discovered issues.

**Phase 6 — Documentation and handoff**

- Complete README.
- Complete `docs/DEVOPS_HANDOFF.md`.
- Update `.agent/PROJECT_CONTEXT.md`.
- Verify ownership boundaries.
- Explain exactly what the DevOps Agent must implement next.

---

# 14. ACCEPTANCE CRITERIA

The project is complete only when:

- The web dashboard works locally.
- Every required API endpoint responds correctly.
- Environment variables control deployment metadata.
- Changing `APP_VERSION` changes the version displayed by the running application after an appropriate restart with the updated configuration.
- Health and readiness simulations work.
- A production Docker image builds successfully.
- The container runs as a non-root user.
- The dashboard works from the running Docker container.
- Automated tests run successfully.
- The interface is responsive.
- No fabricated infrastructure metrics appear.
- The `.agent/` context files exist.
- The root `AGENTS.md` exists.
- The DevOps handoff document is complete.

If any criterion cannot be verified, explicitly identify it as unverified.

---

# FINAL DELIVERABLES

Provide:

1. Complete application source code.
2. Professional dashboard UI.
3. Functional API endpoints.
4. Production Dockerfile.
5. Application tests.
6. `.env.example`.
7. Complete README.
8. `.agent/PROJECT_CONTEXT.md`.
9. `.agent/AGENT_BOUNDARIES.md`.
10. `AGENTS.md`.
11. `docs/DEVOPS_HANDOFF.md`.

Finally, produce a brief implementation summary containing:

- Features implemented.
- Commands to run locally.
- Commands to build and run in Docker.
- Tests executed and their results.
- Known limitations.
- Next steps for the DevOps Agent.

**PRIMARY INSTRUCTION:**

Build the application completely, but preserve a strict boundary between application engineering and the larger Kubernetes GitOps infrastructure project.

This is a supporting application for a real DevOps portfolio project, not a standalone full-stack product.

Prioritize correctness, reliability, clarity, maintainability, testability, and deployment readiness over unnecessary features.

Begin implementation using the existing repository, if present. Do not overwrite unrelated work.
