# Test Automation Roadmap (Autonomy AI Studio)

This is how I would build test automation for Autonomy AI Studio as a QA engineer. My goal is simple: fast checks in PRs, strong coverage on API/integration level, and only a small set of E2E tests for the most important user flows.

## 1) Test pyramid (how I’d distribute coverage)
This product has UI + APIs + an AI/orchestration layer. UI E2E can be slow and flaky, and AI text can change. So I would not rely too much on E2E. I’d aim for:

- **Unit (60–70%)**
  - **What**: validation rules, permission helpers, state reducers, parsing/formatting, prompt/template builders, diff/render logic.
  - **Why**: fast and stable. Most bugs should be caught here.

- **Integration + contract (20–30%)**
  - **API contracts**: request/response schemas, roles/auth, error codes, idempotency, pagination, and “sad paths” (example: inviting a user without role should fail with a clear 4xx error).
  - **Orchestration integration** (with fake LLM and fake Git provider): check the state machine (Draft → Planning → Build → PR/Send-to-devs), retries, timeouts, and cancel.
  - **Why**: catches many real issues, but still stays stable and fast.

- **E2E (5–10%)**
  - **What**: only the “must never break” flows. Everything else should be covered by lower layers.
  - **Why**: E2E is slow and can be flaky (especially with AI). I keep it small and always save trace + screenshots + network logs.

## 2) What I’d automate first (highest priority flows)
I would start with flows that block users or can cause serious damage. Based on what I saw in the product (auth issues, user management edge cases, PR deliverability), I’d prioritize:

- **Auth + account recovery**
  - **Why**: if login or forgot-password is broken, users can’t use the product.
  - **Automate first**: login happy path, basic validation, session stays active, logout, forgot-password request behavior (and don’t leak if account exists).

- **Core task lifecycle (happy path)**
  - **Why**: this is the main value: prompt → plan → build → handoff.
  - **Automate first**: create task, switch modes (fast/smart), wait for final states, and check buttons are enabled/disabled correctly.
  - **How I assert**: I check **states and artifacts** (example: “Planning Completed”, “Pre-PR Completed”). I avoid checking exact AI text.

- **PR/branch deliverability**
  - **Why**: “Send to devs” must be deliverable. If the PR is closed, the user should not lose work or get stuck.
  - **Automate**: detect closed PR state and check the UI gives a safe path (block sending, ask to create a new PR, or auto-create a new PR).

- **Org admin + user management safety**
  - **Why**: high security/operations risk (admin can lock themselves out, invites fail, re-invite conflicts).
  - **Automate**: invite requires role; cancel + re-invite works; role change guardrails (always keep at least one active admin); prevent self-lockout; deactivate user behavior.

## 3) CI/CD integration (how I’d structure runs)
The key is to separate **stable tests** from **AI-in-the-loop tests**. PR checks should not fail randomly.

- **PR checks (fast, deterministic)**
  - Run: lint/typecheck, unit, API contract/integration, and a **small E2E smoke** (login + open “New Task” + basic navigation/state).
  - Target: ~10–15 minutes, and easy to reproduce locally.

- **Nightly**
  - Run: full integration suite, full E2E suite (1–2 browsers), plus a small set of AI-in-the-loop canary tests.
  - Add: track flaky tests (quarantine if needed) and always upload traces/screenshots/logs.

- **Release gates**
  - Run: everything stable + a controlled AI canary set (pin model/settings if possible).
  - Gate on: “critical journeys pass” + “flake rate is low”, not on exact AI text.

## 4) Challenges unique to AI products (and how I handle them)
AI features are not deterministic. Output can change because of model updates, temperature, context/tool changes, or data changes. If we test it like a normal app, we will get many flaky failures.

- **Test stable signals, not full text**
  - Check state transitions, tool calls, artifacts created (plan exists, PR created, status is Completed), permissions, and clear “done” signals in the UI.

- **Control randomness where possible**
  - Unit/integration tests use mocked LLM responses. Real model tests are only for nightly/release canaries.
  - Keep prompts short and structured in tests.

- **Use structured checks**
  - Validate schemas (JSON/YAML), required sections, or simple checks (example: “PR link exists”) instead of full text matching.
  - For free-form text: use regex/keywords around key facts, not full-string equality.

- **Separate product bugs from model drift**
  - Track baselines: completion rate, time-to-complete, retry counts, tool error rates.
  - When the model changes, run a drift suite and update expectations on purpose.

- **Make failures easy to debug**
  - Always save Playwright trace, screenshots, console/network logs, and backend correlation IDs. Save sanitized prompt/tool-call transcripts so we can replay failures.

