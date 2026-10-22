/* Portify — vanilla JavaScript portfolio generator.
   Local mode stores data in this browser. Cloud mode uses Supabase Auth + Row Level Security. */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = "portify.portfolios.v1";
  const CONFIG_KEY = "portify.supabase.config.v1";
  let portfolios = [];
  let currentPortfolio = null;
  let currentView = "home";
  let supabaseClient = null;
  let cloudMode = false;
  let currentUser = null;
  let toastTimer;

  const fields = ["full_name","job_title","email","phone","address","profile_picture","about","education","skills","projects","experience","social_links"];
  const labels = {simple:"Simple",modern:"Modern",creative:"Creative"};

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }
  function safeURL(value) {
    try { const u = new URL(value); return ["http:","https:"].includes(u.protocol) ? u.href : ""; } catch { return ""; }
  }
  function initials(name) {
    return String(name || "Your Name").trim().split(/\s+/).slice(0,2).map(part => part[0] || "").join("").toUpperCase() || "P";
  }
  function showToast(message) {
    const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function readLocal() {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch { return []; }
  }
  function writeLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios)); }
  function makeId() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "p-" + Date.now() + "-" + Math.random().toString(36).slice(2,8); }
  function toLines(value) { return String(value || "").split(/\n/).map(s => s.trim()).filter(Boolean); }
  function parseProjects(value) {
    return toLines(value).map(line => {
      const split = line.split(/\s+[—–-]\s+/);
      return { title: split.shift() || "Project", description: split.join(" — ") };
    });
  }
  function portfolioFromForm() {
    const result = {};
    fields.forEach(key => result[key] = $("#" + key).value.trim());
    result.education_items = toLines(result.education);
    result.skill_items = result.skills.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    result.project_items = parseProjects(result.projects);
    result.experience_items = toLines(result.experience);
    result.social_items = toLines(result.social_links);
    return result;
  }
  function fillForm(item = {}) {
    fields.forEach(key => { $("#" + key).value = item[key] || ""; });
    $("#portfolio-id").value = item.id || "";
    $("#editor-title").textContent = item.id ? "Update your story." : "Let's build your story.";
    $("#save-button-label").textContent = item.id ? "Save changes & choose template" : "Save & choose template";
  }
  function formToRow(data, existing = {}) {
    return {
      ...existing, ...data, id: existing.id || makeId(),
      template: existing.template || "simple",
      created_at: existing.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  function showView(view) {
    if (view === "templates" && !currentPortfolio) { showToast("Save your portfolio details first."); view = "editor"; }
    if (view === "preview" && !currentPortfolio) { showToast("Choose a portfolio to preview."); view = "manage"; }
    currentView = view;
    $$(".view").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
    $$(".nav-link").forEach(el => el.classList.toggle("active", el.dataset.view === view || (view === "preview" && el.dataset.view === "manage") || (view === "templates" && el.dataset.view === "editor")));
    const names = {home:"Overview",editor:"Create portfolio",templates:"Choose template",preview:"Portfolio preview",manage:"My portfolios"};
    $("#breadcrumb-current").textContent = names[view] || "Overview";
    if (view === "manage") renderManage();
    if (view === "templates") updateTemplateSelection();
    $("#sidebar").classList.remove("open");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function updateCounts() {
    $("#portfolio-count").textContent = portfolios.length;
    $("#manage-total").textContent = `${portfolios.length} ${portfolios.length === 1 ? "portfolio" : "portfolios"}`;
  }
  function renderManage() {
    updateCounts();
    const query = ($("#portfolio-search").value || "").trim().toLowerCase();
    const list = $("#portfolio-list");
    const filtered = portfolios.filter(p => `${p.full_name} ${p.job_title} ${p.template}`.toLowerCase().includes(query));
    list.innerHTML = filtered.map(p => `
      <article class="portfolio-row">
        <div class="row-thumb ${escapeHTML(p.template || "simple")}">${escapeHTML(initials(p.full_name))}</div>
        <div class="row-main"><strong>${escapeHTML(p.full_name || "Untitled portfolio")}</strong><div class="row-meta">${escapeHTML(p.job_title || "Personal portfolio")} · Updated ${new Date(p.updated_at || p.created_at || Date.now()).toLocaleDateString()}</div></div>
        <span class="row-badge">${escapeHTML(labels[p.template] || "Simple")} template</span>
        <div class="row-actions"><button data-action="preview" data-id="${escapeHTML(p.id)}">Preview</button><button data-action="edit" data-id="${escapeHTML(p.id)}">Edit</button><button class="delete-row" data-action="delete" data-id="${escapeHTML(p.id)}">Delete</button></div>
      </article>`).join("");
    $("#empty-state").classList.toggle("show", portfolios.length === 0);
    if (portfolios.length > 0 && filtered.length === 0) list.innerHTML = '<div class="empty-state show"><h2>No matching portfolios</h2><p>Try a different search.</p></div>';
  }
  function contactHTML(p) {
    const entries = [];
    if (p.email) entries.push(`<span>✉ ${escapeHTML(p.email)}</span>`);
    if (p.phone) entries.push(`<span>☎ ${escapeHTML(p.phone)}</span>`);
    if (p.address) entries.push(`<span>⌖ ${escapeHTML(p.address)}</span>`);
    (p.social_items || toLines(p.social_links)).forEach(link => {
      const url = safeURL(link); if (url) entries.push(`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(url.replace(/^https?:\/\//,"").replace(/\/$/,""))}</a>`);
    });
    return entries.join("");
  }
  function avatarHTML(p) {
    const url = safeURL(p.profile_picture);
    return url ? `<img class="render-avatar" src="${escapeHTML(url)}" alt="${escapeHTML(p.full_name)} profile picture" onerror="this.outerHTML='<div class=&quot;render-avatar&quot;>${escapeHTML(initials(p.full_name))}</div>'">` : `<div class="render-avatar">${escapeHTML(initials(p.full_name))}</div>`;
  }
  function sectionHTML(title, body) {
    if (!body) return "";
    return `<section class="portfolio-section"><h3>${escapeHTML(title)}</h3>${body}</section>`;
  }
  function itemsHTML(items, fallbackText) {
    if (!items || !items.length) return fallbackText ? `<p>${escapeHTML(fallbackText)}</p>` : "";
    return `<div class="portfolio-items">${items.map(item => {
      if (typeof item === "string") return `<article class="portfolio-item"><strong>${escapeHTML(item)}</strong></article>`;
      return `<article class="portfolio-item"><strong>${escapeHTML(item.title || "Project")}</strong>${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}</article>`;
    }).join("")}</div>`;
  }
  function renderPortfolio(p) {
    const skills = p.skill_items || String(p.skills || "").split(/[,;\n]/).map(s=>s.trim()).filter(Boolean);
    const education = p.education_items || toLines(p.education);
    const projects = p.project_items || parseProjects(p.projects);
    const experience = p.experience_items || toLines(p.experience);
    const about = p.about ? `<p>${escapeHTML(p.about)}</p>` : `<p>Welcome to my portfolio. I'm excited to share what I'm learning and creating.</p>`;
    const contacts = contactHTML(p);
    let html = "";
    if (p.template === "modern") {
      html = `<div class="portfolio-content"><aside class="portfolio-sidebar">${avatarHTML(p)}<h1 class="portfolio-name">${escapeHTML(p.full_name || "Your Name")}</h1><p class="portfolio-role">${escapeHTML(p.job_title || "Your professional title")}</p><div class="portfolio-contact">${contacts}</div></aside><main class="portfolio-main">${sectionHTML("About me",about)}${sectionHTML("Skills",`<div class="portfolio-skills">${(skills.length?skills:["Add your skills"]).map(s=>`<span class="skill-chip">${escapeHTML(s)}</span>`).join("")}</div>`)}${sectionHTML("Selected projects",itemsHTML(projects,"Add your projects to show your work."))}${sectionHTML("Education",itemsHTML(education))}${sectionHTML("Experience",itemsHTML(experience))}</main></div>`;
    } else if (p.template === "creative") {
      html = `<div class="portfolio-content"><header class="creative-header">${avatarHTML(p)}<div><div style="font-size:10px;font-weight:800;letter-spacing:2px;margin-bottom:9px">HELLO, I'M</div><h1 class="portfolio-name">${escapeHTML(p.full_name || "Your Name")}</h1><p class="portfolio-role">${escapeHTML(p.job_title || "Creative thinker · Problem solver")}</p></div></header>${sectionHTML("A little about me",about)}${sectionHTML("Things I do well",`<div class="portfolio-skills">${(skills.length?skills:["Add your skills"]).map(s=>`<span class="skill-chip">${escapeHTML(s)}</span>`).join("")}</div>`)}${sectionHTML("Things I've made",itemsHTML(projects,"Your projects will appear here."))}${sectionHTML("My learning journey",itemsHTML(education))}${sectionHTML("Experience",itemsHTML(experience))}<div class="portfolio-contact">${contacts}</div></div>`;
    } else {
      html = `<div class="portfolio-content"><header class="portfolio-hero">${avatarHTML(p)}<div><h1 class="portfolio-name">${escapeHTML(p.full_name || "Your Name")}</h1><p class="portfolio-role">${escapeHTML(p.job_title || "Your professional title")}</p><div class="portfolio-contact">${contacts}</div></div></header>${sectionHTML("Profile",about)}${sectionHTML("Skills",`<div class="portfolio-skills">${(skills.length?skills:["Add your skills"]).map(s=>`<span class="skill-chip">${escapeHTML(s)}</span>`).join("")}</div>`)}${sectionHTML("Projects",itemsHTML(projects,"Add your projects to show your work."))}${sectionHTML("Education",itemsHTML(education))}${sectionHTML("Work experience",itemsHTML(experience))}</div>`;
    }
    $("#portfolio-render").className = `portfolio-render template-${p.template || "simple"}`;
    $("#portfolio-render").innerHTML = html;
  }
  function updateTemplateSelection() {
    $$("[data-pick-template]").forEach(btn => btn.classList.toggle("selected", !!currentPortfolio && btn.dataset.pickTemplate === currentPortfolio.template));
  }
  async function laravelRequest(url, options = {}) {
    const headers = {
      "Accept": "application/json",
      ...(options.body ? {"Content-Type": "application/json"} : {}),
      ...(options.headers || {})
    };

    if (options.method && options.method !== "GET") {
      const tokenResponse = await fetch("/portify-csrf", {
        credentials: "same-origin",
        headers: {"Accept": "application/json"}
      });
      if (!tokenResponse.ok) throw new Error("Could not get Laravel security token. Please log in again.");
      const tokenData = await tokenResponse.json();
      headers["X-CSRF-TOKEN"] = tokenData.token;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin"
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
  }

  function normalizeLaravelRow(row) {
    const data = row.portfolio_data || {};
    return {
      ...data,
      id: String(row.id),
      title: row.title,
      created_at: row.created_at,
      updated_at: row.updated_at,
      skill_items: data.skill_items || String(data.skills || "").split(/[,;\n]/).map(s => s.trim()).filter(Boolean),
      education_items: data.education_items || toLines(data.education),
      project_items: data.project_items || parseProjects(data.projects),
      experience_items: data.experience_items || toLines(data.experience),
      social_items: data.social_items || toLines(data.social_links)
    };
  }

  async function refreshData() {
    if (cloudMode && currentUser) {
      const rows = await laravelRequest("/api/portfolios");
      portfolios = (rows || []).map(normalizeLaravelRow);
    } else {
      portfolios = readLocal().sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
    }
    updateCounts();
  }

  async function savePortfolio(item) {
    if (cloudMode && currentUser) {
      const existing = portfolios.find(p => String(p.id) === String(item.id));
      const payload = {
        title: item.full_name || "My Portfolio",
        portfolio_data: item
      };
      const row = await laravelRequest(
        existing ? `/api/portfolios/${encodeURIComponent(item.id)}` : "/api/portfolios",
        {
          method: existing ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );
      return normalizeLaravelRow(row);
    }

    const index = portfolios.findIndex(p => p.id === item.id);
    if (index >= 0) portfolios[index] = item;
    else portfolios.unshift(item);
    writeLocal();
    return item;
  }

  async function deletePortfolio(id) {
    if (cloudMode && currentUser) {
      await laravelRequest(`/api/portfolios/${encodeURIComponent(id)}`, {method: "DELETE"});
    } else {
      portfolios = portfolios.filter(p => p.id !== id);
      writeLocal();
    }
    await refreshData();
  }

  function setAccountUI() {
    const name = currentUser?.name || currentUser?.email || "Guest workspace";
    $("#account-name").textContent = name;
    $("#account-status").textContent = cloudMode ? "Laravel account connected" : "Local demo mode";
    $("#account-avatar").textContent = initials(name);
    $("#top-avatar").textContent = initials(name);
    $("#storage-label").textContent = cloudMode ? "Laravel database sync enabled" : "Autosave ready";
    $("#connection-status").innerHTML =
      `<span class="status-dot"></span><span>${cloudMode
        ? "Connected to Laravel. Your portfolios are saved to your account."
        : "Local demo mode is active. Portfolios stay in this browser."}</span>`;
    $("#signout-button")?.classList.toggle("show", !!currentUser);
    $("#sign-out").style.display = currentUser ? "inline-block" : "none";
  }
  async function connectSupabase(url, key) {
    if (!window.supabase?.createClient) throw new Error("Supabase library did not load. Check your internet connection and refresh.");
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url.trim())) throw new Error("Enter a valid Supabase project URL, like https://your-project.supabase.co");
    if (!key.trim()) throw new Error("Enter your Supabase anon / publishable key.");
    const client = window.supabase.createClient(url.trim().replace(/\/$/,""),key.trim());
    const {data,error} = await client.auth.getSession();
    if (error) throw error;
    supabaseClient = client; cloudMode = true; currentUser = data.session?.user || null;
    localStorage.setItem(CONFIG_KEY,JSON.stringify({url:url.trim(),key:key.trim()}));
    setAccountUI();
    if (currentUser) { await refreshData(); showToast("Connected to your cloud workspace."); }
    else showToast("Connected. Sign in or create an account to load cloud portfolios.");
  }
  async function authAction(kind) {
    if (!supabaseClient) { showToast("Connect Supabase first."); return; }
    const email = $("#auth-email").value.trim(), password = $("#auth-password").value;
    if (!email || !password) { showToast("Enter your email and password."); return; }
    if (kind === "signup" && password.length < 6) { showToast("Use a password with at least 6 characters."); return; }
    const result = kind === "signup" ? await supabaseClient.auth.signUp({email,password}) : await supabaseClient.auth.signInWithPassword({email,password});
    if (result.error) { showToast(result.error.message); return; }
    if (kind === "signup" && !result.data.session) { showToast("Account created. Check your email to confirm, then sign in."); return; }
    currentUser = result.data.user || result.data.session?.user || null;
    await refreshData(); setAccountUI();
    showToast(kind === "signup" ? "Account created successfully." : "Welcome back!");
    if (currentUser) { $("#auth-modal").hidden = true; renderManage(); }
  }

  // Navigation
  $$("[data-view]").forEach(button => button.addEventListener("click", () => {
    const view = button.dataset.view;
    if (view === "editor" && currentView !== "editor") fillForm();
    showView(view);
  }));
  $("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#auth-open").addEventListener("click", () => { window.location.href = "/dashboard"; });
  $("#top-avatar").addEventListener("click", () => { window.location.href = "/dashboard"; });
  $("#auth-close").addEventListener("click", () => $("#auth-modal").hidden = true);
  $("#auth-modal").addEventListener("click", e => { if (e.target.id === "auth-modal") $("#auth-modal").hidden = true; });

  $("#portfolio-form").addEventListener("submit", async e => {
    e.preventDefault();
    if (!$("#full_name").value.trim()) { showToast("Please enter your full name."); $("#full_name").focus(); return; }
    const old = portfolios.find(p => p.id === $("#portfolio-id").value);
    const item = formToRow(portfolioFromForm(), old || {});
    try {
      const saved = await savePortfolio(item);
      currentPortfolio = saved;
      await refreshData();
      fillForm(saved);
      showToast("Portfolio details saved successfully.");
      showView("templates");
    } catch (error) { showToast("Save failed: " + (error.message || "Please check your connection and database setup.")); }
  });

  $$("[data-template]").forEach(button => button.addEventListener("click", () => {
    if (!currentPortfolio) { fillForm(); showView("editor"); return; }
    currentPortfolio.template = button.dataset.template;
    showView("preview"); renderPortfolio(currentPortfolio);
  }));
  $$("[data-pick-template]").forEach(button => button.addEventListener("click", async () => {
    if (!currentPortfolio) return;
    currentPortfolio.template = button.dataset.pickTemplate;
    try {
      currentPortfolio = await savePortfolio(currentPortfolio);
      await refreshData(); renderPortfolio(currentPortfolio); showView("preview");
      showToast(`${labels[currentPortfolio.template]} template selected.`);
    } catch (error) { showToast("Could not save template: " + error.message); }
  }));
  $("#portfolio-list").addEventListener("click", async e => {
    const button = e.target.closest("[data-action]"); if (!button) return;
    const item = portfolios.find(p => p.id === button.dataset.id); if (!item) return;
    if (button.dataset.action === "preview") { currentPortfolio = item; renderPortfolio(item); showView("preview"); }
    if (button.dataset.action === "edit") { currentPortfolio = item; fillForm(item); showView("editor"); }
    if (button.dataset.action === "delete") {
      if (!confirm(`Delete the portfolio for "${item.full_name || "this user"}"? This cannot be undone.`)) return;
      try { await deletePortfolio(item.id); if (currentPortfolio?.id === item.id) currentPortfolio = null; renderManage(); showToast("Portfolio deleted."); }
      catch (error) { showToast("Delete failed: " + error.message); }
    }
  });
  $("#portfolio-search").addEventListener("input", renderManage);
  $("#preview-edit").addEventListener("click", () => { if (currentPortfolio) { fillForm(currentPortfolio); showView("editor"); } });
  $("#download-html").addEventListener("click", () => {
    if (!currentPortfolio) return;
    const content = $("#portfolio-render").outerHTML;
    const css = [...document.styleSheets].map(sheet => { try { return [...sheet.cssRules].map(rule=>rule.cssText).join("\n"); } catch { return ""; } }).join("\n");
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(currentPortfolio.full_name)} — Portfolio</title><style>body{margin:0;padding:24px;background:#f0eff8;font-family:Arial,sans-serif}.portfolio-render{max-width:920px;margin:auto;min-height:500px;background:#fff;box-shadow:0 8px 30px #33334412}.portfolio-content{padding:45px}.portfolio-name{font-size:38px}.portfolio-role{color:#777}.portfolio-section{margin-top:32px}.portfolio-section h3{font-size:12px;letter-spacing:1.3px;text-transform:uppercase}.portfolio-render p{line-height:1.8;font-size:13px;color:#65687c;white-space:pre-wrap}.portfolio-skills{display:flex;gap:7px;flex-wrap:wrap}.skill-chip{border-radius:20px;background:#f0edff;color:#6450d7;padding:7px 11px;font-size:11px}.portfolio-items{display:grid;gap:12px}.portfolio-item{border:1px solid #eee;border-radius:10px;padding:14px}.portfolio-contact{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:#7a7d90;margin-top:22px}.render-avatar{width:84px;height:84px;object-fit:cover;border-radius:50%;background:#e6e1ff;display:grid;place-items:center;color:#6652d9;font-size:24px}.portfolio-hero{display:flex;gap:22px;align-items:center;padding-bottom:28px;border-bottom:1px solid #ececf3}.template-modern{background:#22223a;color:#fff}.template-modern .portfolio-content{padding:0;display:grid;grid-template-columns:230px 1fr;min-height:600px}.portfolio-sidebar{background:#2e2d4a;padding:35px 25px;color:#fff}.portfolio-sidebar .render-avatar{width:95px;height:95px;border-radius:24px;margin-bottom:20px}.portfolio-sidebar .portfolio-name{font-size:24px}.portfolio-sidebar .portfolio-role,.template-modern p{color:#b6b3d3}.portfolio-sidebar .portfolio-contact{display:grid;gap:10px;color:#c3c1da}.portfolio-main{padding:40px 38px}.template-modern .portfolio-section h3{color:#a99aff}.template-modern .portfolio-item{background:#2d2c48;border-color:#44425f}.template-modern .portfolio-item strong{color:#fff}.template-modern .skill-chip{background:#49456d;color:#e7e3ff}.template-creative{background:#f8e8d9;color:#27243c}.template-creative .creative-header{display:flex;gap:25px;align-items:center;min-height:180px;padding:20px;background:#f1d0ee;border-radius:14px;overflow:hidden}.template-creative .creative-header .render-avatar{border-radius:35% 50% 45% 50%;width:110px;height:110px;background:#6b55e9;color:#fff}.template-creative .portfolio-section h3{display:inline-block;background:#29263c;color:#fff;padding:8px 11px;border-radius:5px}.template-creative .portfolio-item{background:#fffaf5;border:0}.template-creative .skill-chip{background:#d5f1e1;color:#2f7258}@media(max-width:650px){.portfolio-content{padding:20px}.template-modern .portfolio-content{grid-template-columns:1fr}.portfolio-sidebar,.portfolio-main{padding:20px}.portfolio-hero{flex-direction:column;align-items:flex-start}}</style></head><body>${content}</body></html>`;
    const blob = new Blob([html],{type:"text/html;charset=utf-8"}); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=(currentPortfolio.full_name || "my") .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-portfolio.html"; a.click(); URL.revokeObjectURL(url);
    showToast("Portfolio HTML exported. Open the downloaded file in a browser.");
  });

  $("#connect-supabase").addEventListener("click", () => {
    window.location.href = "/login";
  });

  $("#use-local").addEventListener("click", () => {
    window.location.href = "/dashboard";
  });

  $("#sign-up").addEventListener("click", () => {
    window.location.href = "/register";
  });

  $("#sign-in").addEventListener("click", () => {
    window.location.href = "/login";
  });

  $("#sign-out").addEventListener("click", async () => {
    try {
      const tokenResponse = await fetch("/portify-csrf", {
        credentials: "same-origin",
        headers: { "Accept": "application/json" }
      });

      if (!tokenResponse.ok) throw new Error("Could not get security token.");

      const tokenData = await tokenResponse.json();

      const response = await fetch("/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "X-CSRF-TOKEN": tokenData.token
        }
      });

      if (!response.ok) throw new Error("Logout failed.");
      window.location.href = "/login";
    } catch (error) {
      showToast(error.message || "Could not log out. Please try again.");
    }
  });

  async function init() {
    try {
      const response = await fetch("/portify-user", {
        credentials: "same-origin",
        headers: { "Accept": "application/json" }
      });

      if (!response.ok ||
          !response.headers.get("content-type")?.includes("application/json")) {
        window.location.href = "/login";
        return;
      }

      currentUser = await response.json();

      if (!currentUser || !currentUser.id) {
        window.location.href = "/login";
        return;
      }

      cloudMode = true;
      supabaseClient = null;

      await refreshData();
      setAccountUI();
      renderManage();
    } catch (error) {
      console.error("Could not initialize Portify:", error);
      setAccountUI();
      renderManage();
      showToast("Could not load your portfolios. Please refresh the page.");
    }
  }

  init();
})();