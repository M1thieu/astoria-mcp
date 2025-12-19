import {
  getCurrentUser,
  getUserCharacters,
  getActiveCharacter,
  setActiveCharacter,
  logout,
  isAdmin,
  refreshSessionUser,
} from "../auth.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

async function run() {
  // profil.html already renders its own auth controls for now.
  if (document.getElementById("authControls")) return;

  try {
    await refreshSessionUser();
  } catch {}

  const user = getCurrentUser();
  if (!user) return;

  document.body.dataset.admin = isAdmin() ? "true" : "false";

  let characters = [];
  try {
    characters = await getUserCharacters(user.id);
  } catch {
    characters = [];
  }

  const mount = el("div", "app-topbar");

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

  const badge = el("span", "app-topbar-badge", isAdmin() ? "ADMIN" : "JOUEUR");
  const label = el("span", "app-topbar-label");

  const logoutBtn = el("button", "app-topbar-logout", "Déconnexion");
  logoutBtn.type = "button";

  function syncFromActive() {
    const active = getActiveCharacter();
    if (active && active.id) {
      selector.value = active.id;
      label.textContent = active.name || user.username;
    } else {
      selector.value = "";
      label.textContent = user.username;
    }
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

    const res = await setActiveCharacter(nextId);
    if (!res || !res.success) return;

    // Simplest + safest v1: reload so every page gets consistent data.
    window.location.reload();
  });

  logoutBtn.addEventListener("click", () => {
    logout();
    window.location.href = "login.html";
  });

  mount.append(selector, badge, label, logoutBtn);
  document.body.prepend(mount);
}

run();
