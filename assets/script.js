(() => {
  // --- Global Init (Run once) ---
  const initGlobal = () => {
    // Mobile nav toggle (persistent in header)
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.getAttribute("data-open") === "true";
        nav.setAttribute("data-open", open ? "false" : "true");
        toggle.setAttribute("aria-expanded", open ? "false" : "true");
      });
    }

    // Cursor Trail (Global)
    if (window.matchMedia("(pointer: fine)").matches) {
      let lastX = 0;
      let lastY = 0;
      document.addEventListener("mousemove", (e) => {
        // Throttle creation distance
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        if (dist < 15) return; 
        
        lastX = e.clientX;
        lastY = e.clientY;

        const trail = document.createElement("div");
        trail.className = "cursor-trail";
        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;
        
        // Randomize color slightly based on palette
        const hues = [225, 260, 35]; // Indigo, Violet, Coffee-ish
        const hue = hues[Math.floor(Math.random() * hues.length)];
        trail.style.backgroundColor = `hsl(${hue}, 60%, 65%)`;

        document.body.appendChild(trail);

        // Animate out
        requestAnimationFrame(() => {
          trail.style.opacity = "0";
          trail.style.transform = "translate(-50%, -50%) scale(0.2)";
        });

        setTimeout(() => trail.remove(), 500);
      });
    }
  };

  // --- Page Init (Run on load & after swap) ---
  let revealObserver = null;
  let typeObserver = null;

  const initPage = () => {
    // 1. Year
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());

    // 2. Tabs
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

    // 3. Participation form blocks
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

    // 4. Cleanup old observers
    if (revealObserver) revealObserver.disconnect();
    if (typeObserver) typeObserver.disconnect();

    // 5. Scroll Reveal
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target); // Trigger once
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal-on-scroll").forEach(el => revealObserver.observe(el));

    // 6. Typewriter Effect
    const whisper = document.querySelector(".whisper");
    if (whisper) {
      const lines = Array.from(whisper.querySelectorAll(".line"));
      
      // Store original text and clear
      const lineData = lines.map(line => {
        const text = line.textContent;
        line.textContent = "";
        return { element: line, text: text };
      });

      const typeLine = (index) => {
        if (index >= lineData.length) return;

        const { element, text } = lineData[index];
        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";
        element.appendChild(cursor);

        let charIndex = 0;
        
        const typeChar = () => {
          if (charIndex < text.length) {
            cursor.before(text.charAt(charIndex));
            charIndex++;
            setTimeout(typeChar, 40 + Math.random() * 40);
          } else {
            cursor.remove();
            setTimeout(() => typeLine(index + 1), 300);
          }
        };
        
        typeChar();
      };

      typeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            typeLine(0);
            typeObserver.disconnect();
          }
        });
      }, { threshold: 0.5 });
      
      typeObserver.observe(whisper);
    }
  };

  // --- Navigation Logic ---
  const handleNavigation = async (url, push = true) => {
    // Normalize URL
    const targetUrl = new URL(url, window.location.origin);
    if (targetUrl.href === window.location.href) return; // Ignore same page

    const main = document.querySelector("main");
    if (!main) {
      window.location = url;
      return;
    }

    // 1. Exit Animation
    main.classList.add("page-turn-exit");

    try {
      // 2. Fetch with minimum delay for animation
      const [response] = await Promise.all([
        fetch(url),
        new Promise(r => setTimeout(r, 600)) // Wait for exit animation
      ]);

      if (!response.ok) throw new Error("Network error");
      const html = await response.text();

      // 3. Parse
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newMain = doc.querySelector("main");
      const newTitle = doc.title;

      if (!newMain) throw new Error("No main found in response");

      // 4. Update Nav State
      // Close mobile menu if open
      const nav = document.getElementById("primary-nav");
      const toggle = document.querySelector(".nav-toggle");
      if (nav) nav.setAttribute("data-open", "false");
      if (toggle) toggle.setAttribute("aria-expanded", "false");

      // Update active link
      document.querySelectorAll(".nav a").forEach(a => {
        const linkUrl = new URL(a.href, window.location.origin);
        // Compare pathnames
        if (linkUrl.pathname === targetUrl.pathname) {
          a.setAttribute("aria-current", "page");
        } else {
          a.removeAttribute("aria-current");
        }
      });

      // 5. Swap Content
      document.title = newTitle;
      
      // Use replaceWith to ensure fresh element state
      main.replaceWith(newMain);
      
      // 6. Enter Animation
      window.scrollTo(0, 0);
      newMain.classList.add("page-turn-enter");

      // Remove animation class after it finishes
      setTimeout(() => {
        newMain.classList.remove("page-turn-enter");
      }, 800);

      // 7. Update History
      if (push) {
        history.pushState({}, "", url);
      }

      // 8. Re-initialize page scripts
      initPage();

    } catch (error) {
      console.error("Navigation failed:", error);
      window.location = url; // Fallback to standard navigation
    }
  };

  // Listeners
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    // Ignore internal anchors, special schemes
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    
    // Check if open in new tab
    if (a.target === "_blank") return;

    // Check if same origin
    if (a.hostname !== window.location.hostname) return;

    e.preventDefault();
    handleNavigation(a.href);
  });

  window.addEventListener("popstate", () => {
    handleNavigation(window.location.href, false);
  });

  // Start
  initGlobal();
  initPage();
})();
