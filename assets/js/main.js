(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("nav-toggle");
  var header = document.getElementById("site-header");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("nav-open");
    });
  }

  /* ---------- Table of contents (generated from article headings) ---------- */
  var article = document.getElementById("article-body");
  var tocNav = document.getElementById("toc");
  if (article && tocNav) {
    var headings = article.querySelectorAll("h2, h3");
    if (headings.length === 0) {
      var wrap = tocNav.closest(".toc-wrap");
      if (wrap) wrap.style.display = "none";
    } else {
      var list = document.createElement("ul");
      var currentH2 = null;

      headings.forEach(function (h, i) {
        if (!h.id) {
          h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section-" + i;
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent;
        a.dataset.target = h.id;
        li.appendChild(a);

        if (h.tagName === "H2") {
          list.appendChild(li);
          currentH2 = li;
        } else if (currentH2) {
          var subList = currentH2.querySelector("ul");
          if (!subList) {
            subList = document.createElement("ul");
            currentH2.appendChild(subList);
          }
          subList.appendChild(li);
        } else {
          list.appendChild(li);
        }
      });

      tocNav.appendChild(list);

      /* Scrollspy */
      var tocLinks = tocNav.querySelectorAll("a");
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var link = tocNav.querySelector('a[data-target="' + entry.target.id + '"]');
            if (!link) return;
            if (entry.isIntersecting) {
              tocLinks.forEach(function (l) { l.classList.remove("active"); });
              link.classList.add("active");
            }
          });
        },
        { rootMargin: "-15% 0px -70% 0px" }
      );
      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  /* ---------- Code copy buttons ----------
     Rouge/kramdown always renders the actual code in a <pre class="highlight">,
     wrapped by a <div class="highlight"> (itself optionally wrapped by an outer
     <div class="language-xxx highlighter-rouge"> when a language is set). Targeting
     the <pre> directly and using its immediate parent gives exactly one button per
     block regardless of which wrapper structure is present. */
  document.querySelectorAll("pre.highlight").forEach(function (pre) {
    var container = pre.parentElement;
    if (!container || container.querySelector(".code-copy-btn")) return;

    var btn = document.createElement("button");
    btn.className = "code-copy-btn";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var text = (pre.querySelector("code") || pre).innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1500);
      });
    });

    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    container.appendChild(btn);
  });

  /* ---------- Search modal open/close ---------- */
  var overlay = document.getElementById("search-overlay");
  var trigger = document.getElementById("search-trigger");
  var input = document.getElementById("search-input");

  function openSearch() {
    overlay.classList.add("open");
    input.value = "";
    input.focus();
    if (window.renderSearchResults) window.renderSearchResults("");
  }
  function closeSearch() {
    overlay.classList.remove("open");
  }

  if (trigger) trigger.addEventListener("click", openSearch);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSearch();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      openSearch();
    } else if (e.key === "Escape") {
      closeSearch();
    }
  });
})();
