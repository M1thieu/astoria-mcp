import { el } from "./panel-utils.js";
import {
  getSupabaseClient,
  getAllCharacters,
  setActiveCharacter,
  getActiveCharacter,
  updateCharacter,
  getCurrentUser,
} from "../auth.js";

export const adminPanel = {
  id: "admin",
  title: "Admin",
  renderPanel(ctx) {
    const wrapper = el("div", "panel-card");

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "8px";
    header.appendChild(el("h3", "panel-card-title", "Overview"));
    header.appendChild(el("span", "panel-admin-badge", "ADMIN"));
    wrapper.appendChild(header);

    if (!ctx?.isAdmin) {
      wrapper.appendChild(el("p", "panel-muted", "Admin access required."));
      return wrapper;
    }

    const adminContext = el("div", "panel-admin-stub");
    const adminContextTitle = el("h4", "panel-admin-stub-title", "Admin view");
    const adminContextBody = el("p", "panel-muted", "No active character selected.");
    const adminContextHint = el(
      "p",
      "panel-admin-hint",
      "You are in admin mode. Actions apply to the selected character."
    );
    adminContext.append(adminContextTitle, adminContextBody, adminContextHint);
    wrapper.appendChild(adminContext);

    const status = el("p", "panel-muted", "Loading admin data...");
    wrapper.appendChild(status);

    const kv = document.createElement("dl");
    kv.className = "panel-kv panel-admin-kv";

    const usersLabel = el("dt", "", "Users");
    const userValue = el("dd", "", "-");
    const charLabel = el("dt", "", "Characters");
    const charValue = el("dd", "", "-");

    kv.append(usersLabel, userValue, charLabel, charValue);
    wrapper.appendChild(kv);

    const characterSection = el("div", "panel-admin-actions");
    const characterLabel = document.createElement("label");
    characterLabel.textContent = "Recherche personnage";
    characterLabel.setAttribute("for", "adminCharacterSearch");

    const characterInput = document.createElement("input");
    characterInput.type = "search";
    characterInput.id = "adminCharacterSearch";
    characterInput.className = "panel-select";
    characterInput.placeholder = "Nom du personnage...";

    const characterHint = el(
      "p",
      "panel-admin-hint",
      "Tapez au moins 2 lettres."
    );
    const characterList = el("div", "panel-user-list panel-character-list");

    characterSection.append(characterLabel, characterInput, characterHint, characterList);
    wrapper.appendChild(characterSection);

    const editSection = el("div", "panel-admin-actions");
    const kaelsLabel = document.createElement("label");
    kaelsLabel.textContent = "Kaels (admin)";
    kaelsLabel.setAttribute("for", "adminPanelKaels");

    const kaelsInput = document.createElement("input");
    kaelsInput.type = "number";
    kaelsInput.id = "adminPanelKaels";
    kaelsInput.min = "0";
    kaelsInput.step = "1";
    kaelsInput.className = "panel-select";
    kaelsInput.placeholder = "Kaels";
    kaelsInput.disabled = true;

    const kaelsSave = document.createElement("button");
    kaelsSave.type = "button";
    kaelsSave.className = "auth-button secondary";
    kaelsSave.textContent = "Mettre a jour";
    kaelsSave.disabled = true;

    const kaelsStatus = el("p", "panel-admin-hint", "");
    editSection.append(kaelsLabel, kaelsInput, kaelsSave, kaelsStatus);
    wrapper.appendChild(editSection);

    const userSection = el("div", "panel-admin-actions");
    const userSearchLabel = document.createElement("label");
    userSearchLabel.textContent = "Recherche utilisateur";
    userSearchLabel.setAttribute("for", "adminUserSearch");

    const userInput = document.createElement("input");
    userInput.type = "search";
    userInput.id = "adminUserSearch";
    userInput.className = "panel-select";
    userInput.placeholder = "Nom d'utilisateur...";

    const userHint = el("p", "panel-admin-hint", "Tapez au moins 2 lettres.");
    const userList = el("div", "panel-user-list");

    userSection.append(userSearchLabel, userInput, userHint, userList);
    wrapper.appendChild(userSection);

    const futureSection = el("div", "panel-admin-placeholder");
    const placeholderTitle = el("h4", "panel-admin-placeholder-title", "Future Features");
    const placeholderBody = el(
      "p",
      "panel-muted",
      "User management coming soon (Issue #18)"
    );
    const timestamp = el(
      "p",
      "panel-admin-timestamp",
      `Accessed: ${new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`
    );
    futureSection.append(placeholderTitle, placeholderBody, timestamp);
    wrapper.appendChild(futureSection);

    function updateAdminContext(activeCharacter) {
      if (!activeCharacter || !activeCharacter.id) {
        adminContextBody.textContent = "No active character selected.";
        kaelsInput.value = "";
        kaelsInput.disabled = true;
        kaelsSave.disabled = true;
        return;
      }
      const shortId = activeCharacter.user_id
        ? String(activeCharacter.user_id).slice(0, 8)
        : "????";
      adminContextBody.textContent = `Acting as: ${activeCharacter.name || "Sans nom"} (${shortId})`;
      kaelsInput.value = Number.isFinite(activeCharacter.kaels) ? String(activeCharacter.kaels) : "";
      kaelsInput.disabled = false;
      kaelsSave.disabled = false;
    }

    kaelsSave.addEventListener("click", async () => {
      const active = typeof getActiveCharacter === "function" ? getActiveCharacter() : null;
      if (!active || !active.id) {
        kaelsStatus.textContent = "Selectionnez un personnage d'abord.";
        return;
      }
      const nextKaels = Number.parseInt(kaelsInput.value, 10);
      if (!Number.isFinite(nextKaels) || nextKaels < 0) {
        kaelsStatus.textContent = "Valeur de kaels invalide.";
        return;
      }
      try {
        const result = await updateCharacter(active.id, { kaels: nextKaels });
        if (!result || !result.success) {
          kaelsStatus.textContent = "Mise a jour impossible.";
          return;
        }
        kaelsStatus.textContent = "Kaels mis a jour.";
        window.dispatchEvent(
          new CustomEvent("astoria:character-updated", { detail: { kaels: nextKaels } })
        );
        const badge = document.getElementById("characterKaelsBadge");
        if (badge) {
          badge.textContent = `${nextKaels} kaels`;
          badge.hidden = false;
        }
      } catch (error) {
        console.error("Admin panel kaels update error:", error);
        kaelsStatus.textContent = "Erreur pendant la mise a jour.";
      }
    });

    let userSearchTimer = null;
    let characterSearchTimer = null;
    let supabaseRef = null;
    let allCharacters = [];
    const currentUser = getCurrentUser();

    async function loadUsers(query = "") {
      if (!supabaseRef) {
        supabaseRef = await getSupabaseClient();
      }
      const term = String(query || "").trim();
      if (term.length < 2) {
        userList.innerHTML = "";
        userHint.textContent = "Tapez au moins 2 lettres.";
        return;
      }
      userHint.textContent = "Recherche en cours...";
      const { data, error } = await supabaseRef
        .from("users")
        .select("id, username, role, created_at")
        .ilike("username", `%${term}%`)
        .order("username", { ascending: true })
        .limit(8);

      if (error) {
        console.error("Admin panel user search error:", error);
        userHint.textContent = "Erreur pendant la recherche.";
        userList.innerHTML = "";
        return;
      }

      if (!data || data.length === 0) {
        userHint.textContent = "Aucun resultat.";
        userList.innerHTML = "";
        return;
      }

      userHint.textContent = `${data.length} utilisateur(s)`;
      userList.innerHTML = "";
      data.forEach((user) => {
        const row = document.createElement("div");
        row.className = "panel-user-row";
        const shortId = user.id ? user.id.slice(0, 8) : "????";
        row.innerHTML = `
          <div class="panel-user-name">${user.username || "Sans nom"}</div>
          <div class="panel-user-meta">${user.role || "player"} · ${shortId}</div>
        `;
        const actions = document.createElement("div");
        actions.className = "panel-user-actions";
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "auth-button secondary panel-user-delete";
        deleteBtn.textContent = "Supprimer";
        if (currentUser && user.id === currentUser.id) {
          deleteBtn.disabled = true;
          deleteBtn.textContent = "Vous";
        }
        deleteBtn.addEventListener("click", async () => {
          if (deleteBtn.disabled) return;
          const confirmed = window.confirm(
            `Supprimer definitivement ${user.username || "cet utilisateur"} ?`
          );
          if (!confirmed) return;
          userHint.textContent = "Suppression en cours...";
          try {
            const { error: deleteError } = await supabaseRef
              .from("users")
              .delete()
              .eq("id", user.id);
            if (deleteError) {
              console.error("Admin panel delete user error:", deleteError);
              userHint.textContent = "Suppression impossible.";
              return;
            }
            row.remove();
            userHint.textContent = "Utilisateur supprime.";
            if (!userList.children.length) {
              userHint.textContent = "Aucun resultat.";
            }
            await updateCounts();
          } catch (error) {
            console.error("Admin panel delete user error:", error);
            userHint.textContent = "Erreur pendant la suppression.";
          }
        });
        actions.appendChild(deleteBtn);
        row.appendChild(actions);
        userList.appendChild(row);
      });
    }

    function renderCharacters(query = "") {
      const term = String(query || "").trim().toLowerCase();
      if (term.length < 2) {
        characterList.innerHTML = "";
        characterHint.textContent = "Tapez au moins 2 lettres.";
        return;
      }

      const matches = allCharacters.filter((character) => {
        const name = String(character?.name || "").toLowerCase();
        return name.includes(term);
      });

      if (matches.length === 0) {
        characterList.innerHTML = "";
        characterHint.textContent = "Aucun resultat.";
        return;
      }

      characterHint.textContent = `${matches.length} personnage(s)`;
      characterList.innerHTML = "";
      matches.slice(0, 8).forEach((character) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "panel-user-row panel-character-row";
        const shortId = character.user_id ? character.user_id.slice(0, 8) : "????";
        row.innerHTML = `
          <div class="panel-user-name">${character.name || "Sans nom"}</div>
          <div class="panel-user-meta">Utilisateur ${shortId}</div>
        `;
        row.addEventListener("click", async () => {
          const res = await setActiveCharacter(character.id);
          if (res && res.success) {
            window.dispatchEvent(new CustomEvent("astoria:character-changed"));
          }
        });
        characterList.appendChild(row);
      });
    }

    userInput.addEventListener("input", () => {
      window.clearTimeout(userSearchTimer);
      userSearchTimer = window.setTimeout(() => {
        loadUsers(userInput.value);
      }, 200);
    });

    characterInput.addEventListener("input", () => {
      window.clearTimeout(characterSearchTimer);
      characterSearchTimer = window.setTimeout(() => {
        renderCharacters(characterInput.value);
      }, 200);
    });

    async function updateCounts() {
      if (!supabaseRef) {
        supabaseRef = await getSupabaseClient();
      }
      const { count: userCount } = await supabaseRef
        .from("users")
        .select("id", { count: "exact", head: true });

      const characters = await getAllCharacters();
      allCharacters = Array.isArray(characters) ? characters : [];
      userValue.textContent = userCount ?? "-";
      charValue.textContent = allCharacters.length;
    }

    (async () => {
      try {
        await updateCounts();
        status.textContent = "Recherchez un personnage pour basculer le contexte.";
      } catch (error) {
        console.error("Admin panel error:", error);
        status.textContent = "Unable to load admin data.";
      }
    })();

    const syncAdminState = () => {
      const active = typeof getActiveCharacter === "function" ? getActiveCharacter() : null;
      updateAdminContext(active);
    };

    syncAdminState();

    window.addEventListener("astoria:character-changed", syncAdminState);

    return wrapper;
  },
};
