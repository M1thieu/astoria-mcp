function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

async function loadAuthModule() {
  try {
    return await import("../auth.js");
  } catch (error) {
    console.error("App shell auth load error:", error);
    return null;
  }
}

function ensureTopbarStyles() {
  if (document.getElementById("appShellTopbarStyles")) return;

  const probe = document.createElement("div");
  probe.className = "app-topbar";
  probe.style.position = "static";
  document.body.appendChild(probe);
  const computed = window.getComputedStyle(probe);
  document.body.removeChild(probe);

  const hasStyles =
    computed.borderTopWidth !== "0px" || computed.backgroundColor !== "rgba(0, 0, 0, 0)";
  if (hasStyles) return;

  const style = document.createElement("style");
  style.id = "appShellTopbarStyles";
  style.textContent = `
.app-topbar{position:sticky;top:var(--space-4,8px);margin:var(--space-4,8px) auto;display:flex;align-items:center;gap:var(--space-3,6px);padding:var(--space-3,6px);border-radius:var(--radius-lg,8px);background:rgba(255,255,255,.65);border:1px solid rgba(216,27,96,.25);box-shadow:0 10px 26px rgba(0,0,0,.12);backdrop-filter:blur(12px);z-index:999;max-width:min(920px,calc(100vw - (var(--space-6,12px) * 2)))}
.app-topbar-select{min-width:min(360px,45vw);height:44px;padding:0 var(--space-4,8px);border-radius:var(--radius-lg,8px);border:2px solid rgba(216,27,96,.55);background:rgba(255,255,255,.85);font-family:var(--font-family,system-ui);font-size:var(--text-sm-plus,.82rem);font-weight:600;color:var(--color-primary,#d81b60);box-sizing:border-box}
.app-topbar-select--admin{min-width:min(260px,35vw)}
.app-topbar-select:focus{outline:none;box-shadow:0 0 0 3px rgba(216,27,96,.22)}
.app-topbar-badge{padding:var(--space-2,4px) var(--space-4,8px);border-radius:999px;background:var(--color-primary,#d81b60);color:#fff;font-weight:600;font-size:var(--text-sm,.8rem);letter-spacing:var(--letter-spacing-wide,.08em);white-space:nowrap}
.app-topbar-label{color:var(--color-gray-800,#444);font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}
.app-topbar-souls{display:flex;gap:var(--space-2,4px);align-items:center;padding:2px 6px;border-radius:999px;background:rgba(255,255,255,.8);border:1px solid rgba(216,27,96,.2)}
.app-topbar-soul{display:flex;flex-direction:column;align-items:center;line-height:1}
.app-topbar-soul-label{font-size:.6rem;color:#666;text-transform:uppercase;letter-spacing:.06em}
.app-topbar-soul-value{font-weight:700;color:var(--color-primary,#d81b60);font-size:.78rem}
.app-topbar-logout{padding:var(--space-2,4px) var(--space-4,8px);border-radius:var(--radius-md,6px);border:2px solid rgba(216,27,96,.55);background:rgba(255,255,255,.9);color:var(--color-primary,#d81b60);font-family:var(--font-family,system-ui);font-size:var(--text-sm-plus,.82rem);font-weight:600;cursor:pointer;transition:transform .12s ease,background .12s ease;white-space:nowrap}
.app-topbar-logout:hover{background:rgba(255,255,255,1);transform:translateY(-1px)}
.app-topbar-logout:active{transform:translateY(0)}
@media (max-width:640px){.app-topbar{margin:var(--space-3,6px);max-width:none;justify-content:space-between}.app-topbar-select{min-width:0;flex:1}.app-topbar-label{display:none}.app-topbar-select--admin{display:none}}
`;
  document.head.appendChild(style);
}

async function run() {
  // profil.html already renders its own auth controls for now.
  if (document.getElementById("authControls")) return;

  const auth = await loadAuthModule();
  if (!auth) return;

  const {
    getCurrentUser,
    getUserCharacters,
    getAllCharacters,
    getActiveCharacter,
    setActiveCharacter,
    logout,
    isAdmin,
    refreshSessionUser,
  } = auth;

  try {
    if (typeof refreshSessionUser === "function") {
      await refreshSessionUser();
    }
  } catch {}

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user) return;

  const adminMode = typeof isAdmin === "function" && isAdmin();
  document.body.dataset.admin = adminMode ? "true" : "false";

  let characters = [];
  try {
    if (typeof getUserCharacters === "function") {
      characters = await getUserCharacters(user.id);
    }
  } catch {
    characters = [];
  }

  const mount = el("div", "app-topbar");
  ensureTopbarStyles();

  const selector = el("select", "app-topbar-select");
  selector.setAttribute("aria-label", "Sélectionner un personnage");

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Sélectionner un personnage...";
  selector.appendChild(placeholder);

  characters.forEach((character) => {
    const option = document.createElement("option");
    option.value = character.id;
    option.textContent = character.name;
    selector.appendChild(option);
  });

  const badge = el("span", "app-topbar-badge", adminMode ? "ADMIN" : "JOUEUR");
  const label = el("span", "app-topbar-label");
  const souls = el("div", "app-topbar-souls");
  const soulConso = el("div", "app-topbar-soul");
  const soulConsoLabel = el("span", "app-topbar-soul-label", "Ames conso");
  const soulConsoValue = el("span", "app-topbar-soul-value", "0");
  soulConso.append(soulConsoLabel, soulConsoValue);
  const soulProg = el("div", "app-topbar-soul");
  const soulProgLabel = el("span", "app-topbar-soul-label", "Ames prog");
  const soulProgValue = el("span", "app-topbar-soul-value", "0");
  soulProg.append(soulProgLabel, soulProgValue);
  souls.append(soulConso, soulProg);

  const logoutBtn = el("button", "app-topbar-logout", "Déconnexion");
  logoutBtn.type = "button";

  let adminSelect = null;
  if (adminMode) {
    adminSelect = el("select", "app-topbar-select app-topbar-select--admin");
    adminSelect.setAttribute("aria-label", "MJ : sélectionner un personnage");
    const adminPlaceholder = document.createElement("option");
    adminPlaceholder.value = "";
    adminPlaceholder.textContent = "MJ: choisir un personnage...";
    adminSelect.appendChild(adminPlaceholder);

    try {
      if (typeof getAllCharacters === "function") {
        const allCharacters = await getAllCharacters();
        allCharacters.forEach((character) => {
          const option = document.createElement("option");
          option.value = character.id;
          const shortId = character.user_id ? String(character.user_id).slice(0, 8) : "????";
          option.textContent = `${character.name || "Sans nom"} — ${shortId}`;
          adminSelect.appendChild(option);
        });
      }
    } catch {}

    adminSelect.addEventListener("change", async () => {
      const nextId = adminSelect.value;
      if (!nextId) return;

      if (typeof window.astoriaBeforeCharacterChange === "function") {
        try {
          await window.astoriaBeforeCharacterChange();
        } catch {}
      }

      if (typeof setActiveCharacter !== "function") return;
      const res = await setActiveCharacter(nextId);
      if (!res || !res.success) return;
      window.location.reload();
    });
  }

  function readSoulCounts(active) {
    if (!active || !active.id) return { conso: 0, prog: 0 };
    const key = `fiche-${active.id}-eater`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { conso: 0, prog: 0 };
      const data = JSON.parse(raw);
      const conso = Number.parseInt(data?.eaterAmesConso ?? 0, 10);
      const prog = Number.parseInt(data?.eaterAmesProgression ?? 0, 10);
      return {
        conso: Number.isNaN(conso) ? 0 : conso,
        prog: Number.isNaN(prog) ? 0 : prog
      };
    } catch {
      return { conso: 0, prog: 0 };
    }
  }

  function renderSoulCounts(active) {
    const counts = readSoulCounts(active);
    soulConsoValue.textContent = String(counts.conso);
    soulProgValue.textContent = String(counts.prog);
    souls.title = "Compteur d'ames (stub, base sur la fiche)";
  }

  function syncFromActive() {
    const active = typeof getActiveCharacter === "function" ? getActiveCharacter() : null;
    if (active && active.id) {
      selector.value = active.id;
      label.textContent = active.name || user.username;
    } else {
      selector.value = "";
      label.textContent = user.username;
    }
    renderSoulCounts(active);
  }

  syncFromActive();

  selector.addEventListener("change", async () => {
    const nextId = selector.value;
    if (!nextId) return;

    if (typeof window.astoriaBeforeCharacterChange === "function") {
      try {
        await window.astoriaBeforeCharacterChange();
      } catch {}
    }

    if (typeof setActiveCharacter !== "function") return;
    const res = await setActiveCharacter(nextId);
    if (!res || !res.success) return;

    // Simplest + safest v1: reload so every page gets consistent data.
    window.location.reload();
  });

  logoutBtn.addEventListener("click", () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("astoria_session");
    }
    window.location.href = "login.html";
  });

  if (adminSelect) {
    mount.append(selector, adminSelect, badge, label, souls, logoutBtn);
  } else {
    mount.append(selector, badge, label, souls, logoutBtn);
  }
  document.body.prepend(mount);

  setInterval(() => {
    const active = typeof getActiveCharacter === "function" ? getActiveCharacter() : null;
    renderSoulCounts(active);
  }, 1200);
}

run();
