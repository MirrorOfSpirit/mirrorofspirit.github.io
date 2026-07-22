---
title: "Linux Privilege Escalation Cheat Sheet (Template — replace me)"
date: 2026-02-10
tags: [linux, privesc, cheatsheet]
description: "Quick-reference commands and checks for enumerating Linux privilege escalation paths."
---

Notes don't need the full report structure — use them for cheat sheets, technique
breakdowns, or anything worth remembering that isn't tied to a specific machine.

## Quick enumeration

```bash
sudo -l
find / -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null
crontab -l
```

## Automated tools

- `linpeas.sh` — broad automated enumeration
- `pspy` — process monitoring without root, useful for catching cron jobs

## Common paths

1. Misconfigured `sudo` rules (`sudo -l`)
2. SUID/SGID binaries with known GTFOBins entries
3. Writable cron jobs or scripts run by root
4. Kernel exploits (check version against known CVEs)
5. Credentials left in config files, shell history, or environment variables
