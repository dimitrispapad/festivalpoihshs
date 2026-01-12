// Mobile nav toggle + year + tabs + form path blocks
(() => {
  // Year
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  // Tabs (only where present)
  const tabsRoot = document.querySelector("[data-tabs]");
  if (tabsRoot) {
    const tabs = Array.from(tabsRoot.querySelectorAll('[role="tab"]'));
    const panels = Array.from(tabsRoot.querySelectorAll('[role="tabpanel"]'));

    const activate = (tab) => {
      tabs.forEach(t => t.setAttribute("aria-selected", t === tab ? "true" : "false"));
      panels.forEach(p => {
        const isTarget = p.id === tab.getAttribute("aria-controls");
        if (isTarget) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    };

    tabs.forEach(tab => tab.addEventListener("click", () => activate(tab)));
  }

  // Participation form blocks (only where present)
  const form = document.querySelector("[data-participation-form]");
  if (form) {
    const radios = Array.from(form.querySelectorAll('input[type="radio"][name="path"]'));
    const blocks = Array.from(form.querySelectorAll("[data-block]"));

    const show = (value) => {
      blocks.forEach(b => {
        const match = b.getAttribute("data-block") === value;
        b.hidden = !match;
      });
    };

    const checked = radios.find(r => r.checked);
    if (checked) show(checked.value);

    radios.forEach(r => r.addEventListener("change", () => show(r.value)));
  }
})();
