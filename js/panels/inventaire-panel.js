import { el, safeNumber } from "./panel-utils.js";

export const inventairePanel = {
  id: "inventaire",
  title: "Inventaire",
  fullPageHref: "inventaire.html",
  fullPageLabel: "Ouvrir l'inventaire",
  renderPanel(ctx) {
    const wrapper = el("div", "panel-card");
    wrapper.appendChild(el("h3", "panel-card-title", "Resume"));

    const character = ctx?.character || null;
    if (!character) {
      wrapper.appendChild(
        el("p", "panel-muted", "Selectionnez un personnage pour afficher un resume d'inventaire.")
      );
      return wrapper;
    }

    const summary = el("p", "panel-muted", "Chargement...");
    wrapper.appendChild(summary);

    wrapper.appendChild(
      el("p", "panel-muted panel-spacer", "Ce panneau est un apercu. Les details restent sur la page inventaire.")
    );

    (async () => {
      try {
        const inventoryApi = await import("../api/inventory-service.js");
        const rows = await inventoryApi.getInventoryRows(character.id);
        const itemCount = Array.isArray(rows) ? rows.length : 0;
        const totalQty = Array.isArray(rows)
          ? rows.reduce((sum, entry) => sum + (safeNumber(entry?.qty) || 0), 0)
          : 0;

        const pieces = [];
        if (typeof itemCount === "number") pieces.push(`${itemCount} type(s)`);
        if (typeof totalQty === "number") pieces.push(`${totalQty} total`);

        summary.textContent = pieces.length ? pieces.join(" - ") : "Inventaire vide.";
      } catch (error) {
        console.error("Inventaire panel error:", error);
        summary.textContent = "Impossible de charger l'inventaire.";
      }
    })();

    return wrapper;
  },
};
