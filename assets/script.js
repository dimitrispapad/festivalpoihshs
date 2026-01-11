(() => {
  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.dataset.open = String(!isOpen);
    });

    // Close nav on link click (mobile)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      toggle.setAttribute("aria-expanded", "false");
      nav.dataset.open = "false";
    });
  }

  // Tabs (Program)
  document.querySelectorAll("[data-tabs]").forEach((tabsRoot) => {
    const tabs = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
    const panels = Array.from(tabsRoot.querySelectorAll('[role="tabpanel"]'));

    function activateTab(tab) {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
      });

      const id = tab.getAttribute("aria-controls");
      panels.forEach((p) => {
        p.hidden = p.id !== id;
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(tab);
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = tabs[(i + 1) % tabs.length];
          next.focus();
          activateTab(next);
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = tabs[(i - 1 + tabs.length) % tabs.length];
          prev.focus();
          activateTab(prev);
        }
      });
    });
  });

  // Participation form blocks
  const participationForm = document.querySelector("[data-participation-form]");
  if (participationForm) {
    const radios = participationForm.querySelectorAll('input[name="path"]');
    const blocks = participationForm.querySelectorAll("[data-block]");

    function showBlock(value) {
      blocks.forEach((b) => {
        b.hidden = b.dataset.block !== value;
      });
    }

    const checked = participationForm.querySelector('input[name="path"]:checked');
    if (checked) showBlock(checked.value);

    radios.forEach((r) => {
      r.addEventListener("change", () => showBlock(r.value));
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
