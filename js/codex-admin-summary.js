import { initCharacterSummary } from "./ui/character-summary.js";
import { isAdmin } from "./auth.js";

function initCodexAdminSummary() {
    console.log("[CODEX DEBUG] DOMContentLoaded - Initial astoriaIsAdmin:", window.astoriaIsAdmin);
    return Promise.resolve(initCharacterSummary({ enableDropdown: true, showKaels: true }))
        .then(() => {
            const adminStatus = isAdmin();
            console.log("[CODEX DEBUG] isAdmin() returned:", adminStatus);
            window.astoriaIsAdmin = adminStatus;
            console.log("[CODEX DEBUG] Updated window.astoriaIsAdmin to:", window.astoriaIsAdmin);
            if (!window.astoriaIsAdmin) {
                console.log("[CODEX DEBUG] User is NOT admin");
                return;
            }

            console.log("[CODEX DEBUG] User is admin, showing admin controls");
            const adminAddBtn = document.getElementById("adminAddItemBtn");
            if (adminAddBtn) {
                console.log("[CODEX DEBUG] Showing adminAddItemBtn");
                adminAddBtn.hidden = false;
            }
            const adminActions = document.getElementById("modalAdminActions");
            if (adminActions) {
                console.log("[CODEX DEBUG] Showing modalAdminActions");
                adminActions.hidden = false;
            }
            if (window.astoriaCodex && typeof window.astoriaCodex.refresh === "function") {
                console.log("[CODEX DEBUG] Calling astoriaCodex.refresh()");
                window.astoriaCodex.refresh();
                console.log("[CODEX DEBUG] Refresh complete");
            } else {
                console.error("[CODEX DEBUG] astoriaCodex or refresh() not available!", window.astoriaCodex);
            }
        })
        .catch((error) => {
            console.warn("[CODEX DEBUG] Admin/character summary init skipped:", error);
        });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCodexAdminSummary());
} else {
    initCodexAdminSummary();
}
