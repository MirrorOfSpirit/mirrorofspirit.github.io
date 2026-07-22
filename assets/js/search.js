(function () {
  "use strict";

  var input = document.getElementById("search-input");
  var resultsEl = document.getElementById("search-results");
  if (!input || !resultsEl) return;

  var INDEX_URL = input.dataset.indexUrl || "/search.json";
  var data = null;
  var activeIndex = -1;

  function fetchIndex() {
    if (data) return Promise.resolve(data);
    return fetch(INDEX_URL)
      .then(function (r) { return r.json(); })
      .then(function (json) {
        data = json;
        return data;
      })
      .catch(function () {
        data = [];
        return data;
      });
  }

  function score(item, terms) {
    var tags = (item.tags || []).join(" ");
    var haystack = (item.title + " " + tags + " " + item.excerpt).toLowerCase();
    var s = 0;
    terms.forEach(function (t) {
      if (!t) return;
      if (item.title.toLowerCase().indexOf(t) !== -1) s += 5;
      if (tags.toLowerCase().indexOf(t) !== -1) s += 3;
      if (haystack.indexOf(t) !== -1) s += 1;
    });
    return s;
  }

  function render(query) {
    activeIndex = -1;
    if (!query) {
      resultsEl.innerHTML = '<div class="search-empty">Start typing to search the site…</div>';
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var scored = data
      .map(function (item) { return { item: item, s: score(item, terms) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 12);

    if (scored.length === 0) {
      resultsEl.innerHTML = '<div class="search-empty">No results for “' + escapeHtml(query) + '”</div>';
      return;
    }

    resultsEl.innerHTML = scored
      .map(function (x, i) {
        var item = x.item;
        return (
          '<a class="search-result" href="' + item.url + '" data-idx="' + i + '">' +
          '<span class="r-type">' + item.type + '</span> ' +
          '<div class="r-title">' + escapeHtml(item.title) + "</div>" +
          '<div class="r-snippet">' + escapeHtml(item.excerpt) + "</div>" +
          "</a>"
        );
      })
      .join("");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  window.renderSearchResults = function (q) {
    fetchIndex().then(function () { render(q); });
  };

  input.addEventListener("input", function () {
    fetchIndex().then(function () { render(input.value.trim()); });
  });

  input.addEventListener("keydown", function (e) {
    var items = resultsEl.querySelectorAll(".search-result");
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        window.location = items[activeIndex].getAttribute("href");
      }
      return;
    } else {
      return;
    }
    items.forEach(function (el) { el.classList.remove("active"); });
    items[activeIndex].classList.add("active");
    items[activeIndex].scrollIntoView({ block: "nearest" });
  });

  fetchIndex();
})();
