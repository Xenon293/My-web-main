---
name: security-and-hardening
description: Harden JavaScript web applications and serverless integrations against input abuse, data exposure, unsafe third-party requests, and deployment misconfiguration.
---

# Security and Hardening

Use this skill when working on user input, browser storage, privacy, external integrations, serverless functions, AI features, or deployment configuration.

## Threat model first

Identify each trust boundary before changing code: request bodies, headers, origins, form fields, local storage, third-party APIs, database clients, and model output. For each boundary, consider spoofing, tampering, information disclosure, denial of service, and privilege escalation.

## Required controls

- Validate HTTP method, content type, shape, size, and allowed values at server boundaries.
- Treat browser storage, request headers, upstream responses, and model output as untrusted.
- Keep secrets server-side. Never commit keys or return upstream response bodies, stack traces, or credentials.
- Use framework escaping. Never pass untrusted data to `innerHTML`, `dangerouslySetInnerHTML`, `eval`, SQL, shell commands, or file paths.
- Add rate limits, request timeouts, generic errors, and `Cache-Control: no-store` to public data-handling functions.
- Allowlist origins and third-party hosts. Use HTTPS for external requests and prevent SSRF when URLs are user-controlled.
- Use security headers including an enforced CSP, `frame-ancestors 'none'`, `X-Frame-Options`, `X-Content-Type-Options`, and a strict referrer policy.
- Do not treat local storage as authentication or authorization, and do not store session tokens there.
- Request consent before optional personal-data collection or third-party sharing; document purpose, retention, and deletion behavior.
- Run the native package-manager audit against the committed lockfile before release.

## AI and LLM safety

- Treat prompts and model responses as untrusted data.
- Keep secrets, private user data, and unnecessary system instructions out of prompts.
- Constrain prompt size, request rate, token usage, and tool permissions.
- Render model output with safe, explicit Markdown handling; never execute or inject it as HTML.
- Validate structured model output before using it in application logic.

## Verification checklist

- Test malformed input, oversized input, wrong content types, unexpected origins, upstream failures, and timeouts.
- Confirm no secrets appear in source files or tracked history.
- Inspect deployed response headers in browser DevTools or with an HTTP client.
- Run tests, production build, `git diff --check`, and dependency audit.
- Review privacy and consent behavior at undecided, accepted, rejected, and corrupted-storage states.
