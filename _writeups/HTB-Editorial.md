---
title: HTB Editorial
date: 2026-07-23
difficulty: Easy
os: Linux
skills:
  - Understanding client-side JavaScript
  - SSRF detection and exploitation
  - Enumeration of internal API
  - Sensitive data extraction from .git folder
  - Minimal source code review
description: A writeup on my solution process of HTB's Editorial box
tags:
  - htb
  - web
  - linux
---
This was my first ever solved box on the main Hack The Box platform! I tried to approach it with the methodology framework that I was taught and applied in my CPTS journey. Seems like it worked out fine!

## Information Gathering

Considering this is a box and not a real environment, OSINT is pretty unlikely to be applicable, so I immediately crossed it out of my list of things to do.

Being connected to the HTB VPN, I started out with a classic, non-evasive Nmap scan to identify running services.

```
❯ sudo nmap 10.129.37.134
[sudo] password for george:
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-23 03:07 EEST  
Nmap scan report for 10.129.37.134  
Host is up (0.045s latency).    
Not shown: 998 closed tcp ports (reset)  
PORT   STATE SERVICE  
22/tcp open  ssh  
80/tcp open  http
```

I had no credentials yet at this point, so the running web service was the obvious point of entry. I ran a couple more Nmap scans, including a full port scan, but none of it revealed anything noteworthy.

Visiting the website served by the web service, I found this form that had a URL submission field and a file upload field, both of which could be hiding some major vulnerabilities (SSRF and Insecure File Uploads come to mind). 

![](/assets/img/Pasted%20image%2020260726160149.png)

Embarassingly enough, I got stuck here for a little bit! This is because I thought those 2 aforementioned fields were a part of what I thought was the rest of the form, which I could see sending POST requests to `/upload` on BurpSuite. But I just couldn't find the URL and file upload values I was submitting in those requests!

It was only after I decided to inspect the HTML, that things cleared up. Turns out, the URL and file upload fields were a *separate* form of their own, submitted with an XHR request that is triggered by that preview button in the UI. It was pretty awkward on my display because, unlike in the screenshot above, I had the window minimized.

![](/assets/img/Pasted%20image%2020260726160810.png)

![](/assets/img/Pasted%20image%2020260726161145.png)

Since file uploads can definitively lead to RCE when not properly secured, that was the first parameter I tried tinkering with. However, I had no knowledge of the upload location for those files, or what was actually happening in the back end at all... Long story short, that parameter led me nowhere, so I gave up on it.

Moving on to the URL submission parameter, I started to test for SSRF by hosting a web server on my attack host and trying to call back to it.

![](/assets/img/Pasted%20image%2020260726161251.png)
![](/assets/img/Pasted%20image%2020260726161936.png)

This interaction revealed a request-response cycle, confirming SSRF!
![](/assets/img/Pasted%20image%2020260726162008.png)

The response didn't include the contents of the requested file, containing this `/static/uploads/...` endpoint instead. 
![](/assets/img/Pasted%20image%2020260726162205.png)

However, the very next request is directed at that endpoint (as scripted by that same JS snippet shown earlier), which reveals the requested file's contents are stored and publicly readable, therefore indicating that the SSRF vulnerability is exploitable :) 
![](/assets/img/Pasted%20image%2020260726162933.png)

## SSRF Exploitation

Since this is HTB, I knew I wasn't dealing with an enterprise cloud environment, so I didn't try out the typical exploitation routes on AWS/Azure/GCP.

The next obvious option to try out after that was a mass port "scan" of the target machine itself (localhost). To do this, I left BurpSuite Community Edition with its throttled (and frankly quite useless in many cases) Intruder and opened up Caido, which offers an option equivalent to BurpSuite Pro's unthrottled Intruder, completely free of charge! (Quick disclaimer: This is not an ad. 😭)

![](/assets/img/Pasted%20image%2020260726144032.png)

Most scanned ports returned the same empty .jpg URL (response size: 227), that was clearly just a placeholder for when the server couldn't make sense of the provided URL.
But after a little while, I got to port 5000 ("ID 1000" in the screenshot below, since I was scanning in sets of 1000 and this was the 5th set) and saw a different response size. Upon closer inspection, I found the same kind of URL that popped up in my earlier testing!
Having my path laid out for me, I followed the URL and voila: Documentation for an internal API!

![](/assets/img/Pasted%20image%2020260726145245.png)

![](/assets/img/Pasted%20image%2020260726144652.png)

After noting down that documentation, I proceeded to test the obvious by sending requests-via-SSRF to every single one of those endpoints. Some responded with the usual placeholder .jpg, others didn't respond at all, and some responded with miscellaneous info. The one that actually helped me proceed was the 3rd one in that list, because it gave me credentials :)

![](/assets/img/Pasted%20image%2020260726145402.png)

__Discovered credentials__\
Username: `dev`\
Password: `dev080217_devAPI!@`

Having found these, I decided to test them on the SSH service I discovered in the beginning (utilizing the marvelous [Penelope](https://github.com/brightio/penelope) shell handler), which successfully gave me RCE on the server!

![](/assets/img/Pasted%20image%2020260726145806.png)
## Privilege Escalation

The very first thing I do after I land on a Linux shell is run `sudo -l`, revealing in this case that `dev` doesn't have `sudo` rights on this machine.\
The next thing I try out is upload LinPEAS and map out the entire surface I'm dealing with :)

![](/assets/img/Pasted%20image%2020260726150951.png)

![](/assets/img/Pasted%20image%2020260726151033.png)

The elephant in the room here was Copy Fail, which I was confident was going to work on this box that predates its public disclosure.
But exploiting it would have obviously defeated the purpose of tackling this box to begin with, so I ignored it and looked at the rest.

I tried uploading and running PoCs for all of those other kernel vulnerabilities, but to no avail; it became clear to me that the box maker probably didn't intend for me to "cheese" my way out of this one!

Looking around in the machine, I discovered user `prod` under `/home`, so I thought that maybe the intended route here is for me to compromise that user first, before reaching `root`.\
To that end, I continued looking around and found an `apps` folder in `/home/dev`, containing a `.git` folder. Looking at the commit descriptions with the `git log` command, I found an interesting mention of potential data erasure on the `prod` user.
![](/assets/img/Pasted%20image%2020260726165539.png)

This made me want to look at that commit in more detail, which I did with `git log -p`. And indeed, I struck gold!
![](/assets/img/Pasted%20image%2020260726165656.png)

__Discovered credentials (Total: 2)__\
Username: `prod`\
Password: `080217_Producti0n_2023!@`

With these credentials, I logged in as user `prod` and discovered that the account has `sudo` privileges for the Python script shown below.
![](/assets/img/Pasted%20image%2020260726170021.png)

This is the code of that script:
```Python
#!/usr/bin/python3

import os
import sys
from git import Repo

os.chdir('/opt/internal_apps/clone_changes')

url_to_clone = sys.argv[1]

r = Repo.init('', bare=True)
r.clone_from(url_to_clone, 'new_changes', multi_options=["-c protocol.ext.allow=always"])
```

Now, on one hand, I am seasoned enough to realize here that this is in all likelihood the intended privesc vector. On the other hand, I felt a bit out of my depth...I am not very experienced with source code review (hoping to change that with my soon-to-start OSWE journey!), and this exploit involving a .git repo seemed pretty specialized.\
So, shameful as it may be, I will admit that I enlisted the help of LLMs at this point. 😭\
This revealed to me that I was dealing with CVE-2022-24439, a CVE concerning the fact that the `clone_from()` function in the GitPython library runs arbitrary system commands, submitted via the `ext::` scheme, directly in an actual shell. Moreover, `ext::` has been explicitly enabled here via the `multi_options=["-c protocol.ext.allow=always"]` argument.

After some trial and error, I successfully exploited the CVE with this PoC:
```bash
sudo /usr/bin/python3 /opt/internal_apps/clone_changes/clone_prod_change.py 'ext::sh -c cp$IFS/bin/bash$IFS/tmp/rootbash;chmod$IFS+s$IFS/tmp/rootbash'
```

![](/assets/img/Pasted%20image%2020260726172455.png)

![](/assets/img/Pasted%20image%2020260726172556.png)

And that concludes my first box ever!
## Lessons Learned

- Inspecting client-side JS is absolutely essential and can offer insights even in the simplest of cases.
- Don't be afraid to do massive Intruder scans when SSRF is involved – this can prove to be the only way forward. Of course, be careful not to disrupt the target environment or trip up a WAF in real conditions.
- .git folders are a treasure trove for information disclosure.

## Mitigations

- The `/upload-cover` endpoint's functionality should at least be made to only work with a whitelist of specific domains, as any kind of unauthenticated arbitrary file upload is too risky and other measures (e.g. IP blacklists) can potentially be bypassed. Also, responses from the `/upload-cover` endpoint should be sanitized, so that they don't return the location where the uploaded URL's contents were saved.
- GitPython should be updated to version `3.1.32` and beyond (to be precise, the CVE in question was patched in `3.1.30`, but a subsequent bypass raised the need for an extra patch). 

