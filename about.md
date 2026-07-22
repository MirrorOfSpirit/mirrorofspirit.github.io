---
layout: page
title: About
permalink: /about/
---

<div class="about-grid">
  <div class="about-side">
    <img class="about-avatar" src="{{ "/assets/img/avatar-placeholder.svg" | relative_url }}" alt="{{ site.author.name }}">
    <h3 style="margin-top:0;">{{ site.author.name }}</h3>
    <p style="color:var(--text-dim); font-size:0.9rem;">{{ site.author.role }}</p>
    <div class="about-links">
      {% if site.author.github %}<a href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener">GitHub ↗</a>{% endif %}
      {% if site.author.linkedin %}<a href="https://linkedin.com/in/{{ site.author.linkedin }}" target="_blank" rel="noopener">LinkedIn ↗</a>{% endif %}
      {% if site.author.resume %}<a href="{{ site.author.resume | relative_url }}" target="_blank" rel="noopener">Résumé (PDF) ↓</a>{% endif %}
      <a href="mailto:{{ site.author.email }}">Email</a>
    </div>
  </div>

  <div>
    <h2 style="margin-top:0;">Background</h2>
    <p>
      Replace this with a few paragraphs about your background: how you got into security,
      what you focus on (web app, AD/Windows, cloud, etc.), certifications you hold or are
      working toward (OSCP, eJPT, CPTS, etc.), and what kind of role you're looking for.
    </p>

    <h2>Methodology</h2>
    <p>
      Briefly describe how you approach an engagement or a box — recon philosophy, tooling
      preferences, note-taking process. Recruiters skim this to gauge how you think, not just
      what you've broken into.
    </p>

    <h2>Toolkit</h2>
    <ul class="skills-list">
      <li>Nmap, Nuclei, Burp Suite</li>
      <li>BloodHound / Impacket / CrackMapExec</li>
      <li>Ghidra, pwndbg</li>
      <li>Python, Bash</li>
    </ul>

    <h2>Certifications</h2>
    <ul>
      <li>OSCP — Offensive Security Certified Professional <em>(target: 2026)</em></li>
      <li>CompTIA Security+</li>
    </ul>
  </div>
</div>
