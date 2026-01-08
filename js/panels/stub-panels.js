import { el } from "./panel-utils.js";

function readJson(key, fallback = null) {
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function sumValues(map) {
  if (!map || typeof map !== "object") return 0;
  return Object.values(map).reduce((sum, value) => {
    const n = Number(value);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function buildStubPanel({ id, title, fullPageHref, fullPageLabel, blurb, load }) {
  return {
    id,
    title,
    fullPageHref,
    fullPageLabel,
    renderPanel(ctx) {
      const wrapper = el("div", "panel-card");
      wrapper.appendChild(el("h3", "panel-card-title", "Apercu"));
      const summary = el("p", "panel-muted", blurb);
      wrapper.appendChild(summary);
      wrapper.appendChild(
        el(
          "p",
          "panel-muted panel-spacer",
          "Ouvrez la page complete pour les actions et les details."
        )
      );

      if (typeof load === "function") {
        void load(summary, ctx).catch((error) => {
          console.warn("Panel stub load failed:", error);
        });
      }
      return wrapper;
    },
  };
}

export const codexPanel = buildStubPanel({
  id: "codex",
  title: "Codex",
  fullPageHref: "codex.html",
  fullPageLabel: "Ouvrir le Codex",
  blurb: "Panel en preparation. Recap des objets et recherches a venir.",
  load: async (summary) => {
    try {
      const itemsApi = await import("../api/items-service.js");
      if (!itemsApi?.getAllItems) return;
      const items = await itemsApi.getAllItems();
      if (!Array.isArray(items)) return;
      const enabled = items.filter((item) => item?.enabled !== false).length;
      summary.textContent = `${items.length} objet(s) - ${enabled} actif(s)`;
    } catch {
      // keep fallback text
    }
  },
});

export const competencesPanel = buildStubPanel({
  id: "competences",
  title: "Competences",
  fullPageHref: "competences.html",
  fullPageLabel: "Ouvrir les competences",
  blurb: "Panel en preparation. Statistiques et validation seront centralisees ici.",
  load: async (summary, ctx) => {
    const character = ctx?.character || null;
    if (!character?.id) {
      summary.textContent = "Selectionnez un personnage pour voir les competences.";
      return;
    }

    const profileData = character.profile_data || {};
    let competences = profileData.competences || null;

    if (!competences) {
      const prefix = `astoria_competences_${character.id}:`;
      competences = {
        pointsByCategory: readJson(`${prefix}skillsPointsByCategory`, {}),
        allocationsByCategory: readJson(`${prefix}skillsAllocationsByCategory`, {}),
        baseValuesByCategory: readJson(`${prefix}skillsBaseValuesByCategory`, {}),
        locksByCategory: readJson(`${prefix}skillsLocksByCategory`, {}),
      };
    }

    const pointsByCategory = competences?.pointsByCategory || {};
    const allocationsByCategory = competences?.allocationsByCategory || {};
    const baseValuesByCategory = competences?.baseValuesByCategory || {};
    const locksByCategory = competences?.locksByCategory || {};

    const categoryCount = Object.keys(pointsByCategory).length;
    const pointsLeft = sumValues(pointsByCategory);
    const lockedCount = Object.values(locksByCategory || {}).filter(Boolean).length;

    let allocated = 0;
    Object.values(allocationsByCategory || {}).forEach((category) => {
      allocated += sumValues(category);
    });
    Object.values(baseValuesByCategory || {}).forEach((category) => {
      allocated += sumValues(category);
    });

    if (!categoryCount) {
      summary.textContent = "Aucune competence enregistree.";
      return;
    }

    summary.textContent = `${categoryCount} categories - ${pointsLeft} points dispo - ${allocated} investis`;
    if (lockedCount > 0) {
      summary.textContent += ` - ${lockedCount} verrouillee(s)`;
    }
  },
});

export const hdvPanel = buildStubPanel({
  id: "hdv",
  title: "Hotel de vente",
  fullPageHref: "hdv.html",
  fullPageLabel: "Ouvrir le marche",
  blurb: "Panel en preparation. Suivi des ventes et alertes a venir.",
  load: async (summary) => {
    try {
      const marketApi = await import("../api/market-service.js");
      if (!marketApi?.getMyListings || !marketApi?.getMyHistory) return;
      const listings = await marketApi.getMyListings();
      const history = await marketApi.getMyHistory();
      if (!Array.isArray(listings) || !Array.isArray(history)) return;
      summary.textContent = `${listings.length} offre(s) active(s) - ${history.length} vente(s)`;
    } catch {
      // keep fallback text
    }
  },
});

export const magiePanel = buildStubPanel({
  id: "magie",
  title: "Magie",
  fullPageHref: "magie.html",
  fullPageLabel: "Ouvrir la magie",
  blurb: "Panel en preparation. Acces rapide aux notes et validations.",
  load: async (summary, ctx) => {
    const character = ctx?.character || null;
    if (!character?.id) {
      summary.textContent = "Selectionnez un personnage pour voir la magie.";
      return;
    }

    const profilePayload = character.profile_data?.magic_sheet || null;
    const key = `magicSheetPages-${character.id}`;
    const stored = readJson(key, null) || readJson("magicSheetPages", null);
    const payload = stored && Array.isArray(stored.pages) ? stored : profilePayload;

    const pages = Array.isArray(payload?.pages) ? payload.pages : [];
    const pageCount = pages.length;
    const capCount = pages.reduce(
      (sum, page) => sum + (Array.isArray(page?.capacities) ? page.capacities.length : 0),
      0
    );

    if (!pageCount) {
      summary.textContent = "Aucune page de magie.";
      return;
    }

    summary.textContent = `${pageCount} page(s) - ${capCount} capacite(s)`;
  },
});

export const nokorahPanel = buildStubPanel({
  id: "nokorah",
  title: "Nokorah",
  fullPageHref: "nokorah.html",
  fullPageLabel: "Ouvrir Nokorah",
  blurb: "Panel en preparation. Apercu des effets et ressources.",
  load: async (summary, ctx) => {
    const character = ctx?.character || null;
    if (!character?.id) {
      summary.textContent = "Selectionnez un personnage pour voir le Nokorah.";
      return;
    }

    const suffix = character.id;
    const active = readJson(`nokorahActive:${suffix}`, null);
    const rarity = readJson(`nokorahRarity:${suffix}`, active?.rarity || null);
    const upgrade = Number(readJson(`nokorahUpgradeLevel:${suffix}`, 0)) || 0;
    const bonuses = readJson(`nokorahBonuses:${suffix}`, []);
    const bonusCount = Array.isArray(bonuses) ? bonuses.length : 0;

    if (!active?.name) {
      summary.textContent = "Aucun Nokorah actif.";
      return;
    }

    const rarityLabel = rarity ? String(rarity) : "Inconnu";
    summary.textContent = `${active.name} - ${rarityLabel} - niv ${upgrade} - ${bonusCount} bonus`;
  },
});
