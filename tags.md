---
layout: page
title: Tags
permalink: /tags/
---

{% assign all_items = site.writeups | concat: site.projects | concat: site.notes %}
{% assign all_tags = all_items | map: "tags" | compact | uniq | sort %}

<div class="filter-bar" style="margin-bottom:32px;">
  {% for t in all_tags %}<a class="tag" href="#{{ t | slugify }}" style="font-size:0.8rem;">#{{ t }}</a>{% endfor %}
</div>

{% for t in all_tags %}
  <h2 id="{{ t | slugify }}">#{{ t }}</h2>
  {% assign tagged = all_items | where_exp: "item", "item.tags contains t" | sort: "date" | reverse %}
  {% for item in tagged %}
    <a class="list-row" href="{{ item.url | relative_url }}">
      <span class="title">{{ item.title }}</span>
      <span class="badge badge--neutral">{{ item.collection }}</span>
      <span class="date">{{ item.date | date: "%b %-d, %Y" }}</span>
    </a>
  {% endfor %}
{% endfor %}
