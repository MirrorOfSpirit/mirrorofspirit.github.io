---
title: "Recon Automation Toolkit (Template — replace me)"
date: 2026-02-01
tags: [python, automation, recon, tooling]
description: "A wrapper around nmap/httpx/nuclei that chains subdomain enumeration, port scanning, and vuln scanning into one report."
repo: "https://github.com/yourusername/recon-toolkit"
link: ""
---

Replace this with real project write-ups: what it does, why you built it, and the
interesting engineering or research decisions behind it. Recruiters read this section to
judge whether you can build tools, not just use them.

## Overview

Short description of the problem the project solves and who it's for.

## How it works

```python
def run_recon(domain: str) -> dict:
    subdomains = enumerate_subdomains(domain)
    live_hosts = probe_hosts(subdomains)
    findings = run_nuclei(live_hosts)
    return build_report(domain, live_hosts, findings)
```

Walk through the architecture, key design decisions, and any trade-offs you made.

## Result

Include screenshots, sample output, or metrics (e.g. "cuts manual recon time from ~45
minutes to under 5 on a typical external engagement").
