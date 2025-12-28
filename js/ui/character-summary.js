const CHARACTER_STORAGE_KEY = "astoria_active_character";
const LEGACY_SUMMARY_KEY = "astoria_character_summary";

export function getActiveCharacterFromStorage() {
    const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function getLegacySummary() {
    const raw = localStorage.getItem(LEGACY_SUMMARY_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function resolveCharacterContext({ includeQueryParam = false } = {}) {
    const character = getActiveCharacterFromStorage();
    if (character && character.id) {
        return { key: character.id, character };
    }
    const legacy = getLegacySummary();
    if (legacy && legacy.id) {
        return { key: legacy.id, character: null };
    }
    if (includeQueryParam) {
        const params = new URLSearchParams(window.location.search);
        const fallback = params.get("character");
        return { key: fallback || "default", character: null };
    }
    return { key: "default", character: null };
}

export function buildRoleText(character) {
    if (!character) return "Classe / Role / Surnom";
    const parts = [];
    if (character.race) parts.push(character.race);
    if (character.class) parts.push(character.class);
    return parts.length ? parts.join(" - ") : "Classe / Role / Surnom";
}

export function buildSummary(context) {
    if (context?.character) {
        const profileData = context.character.profile_data || {};
        const stored = profileData.fiche_summary;
        const base = {
            id: context.character.id,
            name: context.character.name || "Personnage",
            role: buildRoleText(context.character),
            avatar_url: profileData.avatar_url || ""
        };
        if (stored && typeof stored === "object") {
            return {
                ...base,
                ...stored,
                id: stored.id || base.id,
                name: stored.name || base.name,
                role: stored.role || base.role,
                avatar_url: stored.avatar_url || base.avatar_url
            };
        }
        return base;
    }
    return getLegacySummary();
}

export function getDefaultSummaryElements() {
    const nameEl = document.getElementById("characterSummaryName");
    return {
        nameEl,
        taglineEl: document.getElementById("characterSummaryTagline"),
        avatarImgEl: document.getElementById("characterSummaryAvatar"),
        initialEl: document.getElementById("characterSummaryInitial"),
        linkEl: nameEl && nameEl.tagName === "A" ? nameEl : null
    };
}

export function applySummaryToElements(elements, summary) {
    if (!elements) return;
    const { nameEl, taglineEl, avatarImgEl, initialEl, linkEl } = elements;
    if (!nameEl || !taglineEl || !initialEl) return;

    const name = summary?.name || "Personnage";
    const role = summary?.role || "Classe / Role / Surnom";
    const avatarUrl = summary?.avatar_url || "";

    nameEl.textContent = name;
    taglineEl.textContent = role;

    const linkTarget = linkEl || (nameEl.tagName === "A" ? nameEl : null);
    if (linkTarget) {
        linkTarget.setAttribute(
            "href",
            summary?.id ? `profil.html?character=${encodeURIComponent(summary.id)}` : "profil.html"
        );
    }

    if (avatarImgEl) {
        if (avatarUrl) {
            avatarImgEl.src = avatarUrl;
            avatarImgEl.hidden = false;
            initialEl.hidden = true;
        } else {
            avatarImgEl.hidden = true;
            avatarImgEl.removeAttribute("src");
            initialEl.hidden = false;
            initialEl.textContent = name ? name.charAt(0).toUpperCase() : "?";
        }
    } else {
        initialEl.hidden = false;
        initialEl.textContent = name ? name.charAt(0).toUpperCase() : "?";
    }
}

export function initCharacterSummary({ includeQueryParam = false, elements } = {}) {
    const resolvedElements = elements || getDefaultSummaryElements();
    const context = resolveCharacterContext({ includeQueryParam });
    const summary = buildSummary(context);
    applySummaryToElements(resolvedElements, summary);
    return { context, summary, elements: resolvedElements };
}
