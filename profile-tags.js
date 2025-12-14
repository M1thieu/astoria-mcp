const STORAGE_PREFIX = 'profile-tags';

function getStorageKey(characterId) {
    return characterId ? `${STORAGE_PREFIX}-${characterId}` : STORAGE_PREFIX;
}

function loadSelected(characterId) {
    try {
        const raw = localStorage.getItem(getStorageKey(characterId));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveSelected(characterId, selectedIds) {
    try {
        localStorage.setItem(getStorageKey(characterId), JSON.stringify(selectedIds));
    } catch {
        // ignore
    }
}

const ICON = {
    crown: String.fromCodePoint(0x1f451),
    game: String.fromCodePoint(0x1f3ae),
    spider: String.fromCodePoint(0x1f577, 0xfe0f),
    bear: String.fromCodePoint(0x1f43b),
    goat: String.fromCodePoint(0x1f410),
    turtle: String.fromCodePoint(0x1f422),
    book: String.fromCodePoint(0x1f4d6),
    fire: String.fromCodePoint(0x1f525),
    blood: String.fromCodePoint(0x1fa78),
    greenBook: String.fromCodePoint(0x1f4d7),
    gem: String.fromCodePoint(0x1f48e),
    balloon: String.fromCodePoint(0x1f388),
    teddy: String.fromCodePoint(0x1f9f8),
    star: String.fromCodePoint(0x2b50),
    glow: String.fromCodePoint(0x1f31f),
    dna: String.fromCodePoint(0x1f9ec),
    skull: String.fromCodePoint(0x1f480),
    crystal: String.fromCodePoint(0x1f52e),
    pinch: String.fromCodePoint(0x1f90f),
    dagger: String.fromCodePoint(0x1f5e1, 0xfe0f),
    swords: String.fromCodePoint(0x2694, 0xfe0f),
    hammer: String.fromCodePoint(0x2692, 0xfe0f),
    sparkles: String.fromCodePoint(0x2728),
    dizzy: String.fromCodePoint(0x1f4ab),
    gear: String.fromCodePoint(0x2699, 0xfe0f),
    candle: String.fromCodePoint(0x1f56f, 0xfe0f),
    testTube: String.fromCodePoint(0x1f9ea),
    broccoli: String.fromCodePoint(0x1f966),
    bomb: String.fromCodePoint(0x1f4a3),
    shower: String.fromCodePoint(0x1f6bf),
    antenna: String.fromCodePoint(0x1f4e1),
    coffin: String.fromCodePoint(0x26b0, 0xfe0f),
    bat: String.fromCodePoint(0x1f987),
    sprout: String.fromCodePoint(0x1f331),
    swan: String.fromCodePoint(0x1f9a2),
    bright: String.fromCodePoint(0x1f506),
    castle: String.fromCodePoint(0x1f3f0),
    shield: String.fromCodePoint(0x1f6e1, 0xfe0f),
    coin: String.fromCodePoint(0x1f4b0),
    wheat: String.fromCodePoint(0x1f33e),
    hole: String.fromCodePoint(0x1f573, 0xfe0f),
    chains: String.fromCodePoint(0x26d3, 0xfe0f),
    purple: String.fromCodePoint(0x1f7e3),
    blue: String.fromCodePoint(0x1f535)
};

const BOX = {
    prefix: '\u2503\u251c\u3008', // ┃├〈
    close: '\u300b', // 》
    arrow: '\u2761\u2192' // ❱→
};

function label(icon, text) {
    return `${BOX.prefix}${icon}${BOX.close}${BOX.arrow} ${text}`;
}

const TAG_GROUPS = [
    {
        title: 'Admin',
        tags: [
            { id: 'role_admin', label: label(ICON.crown, 'Admin') },
            { id: 'role_player', label: label(ICON.game, 'Joueur') }
        ]
    },
    {
        title: 'Houses',
        tags: [
            { id: 'house_red_spider', label: label(ICON.spider, 'Red Spider House') },
            { id: 'house_blue_bear', label: label(ICON.bear, 'Blue Bear House') },
            { id: 'house_violet_goat', label: label(ICON.goat, 'Violet Goat House') },
            { id: 'house_green_turtle', label: label(ICON.turtle, 'Green Turtle House') }
        ]
    },
    {
        title: 'Schools',
        tags: [
            { id: 'school_onyx', label: label(ICON.book, 'Universit\u00e9 Onyx') },
            { id: 'school_diamond', label: label(ICON.fire, 'Universit\u00e9 Diamant') },
            { id: 'school_ruby', label: label(ICON.blood, 'Universit\u00e9 Rubis') },
            { id: 'school_emerald', label: label(ICON.greenBook, 'Lyc\u00e9e Emeraude') },
            { id: 'school_sapphire', label: label(ICON.gem, 'Coll\u00e8ge Saphir') },
            { id: 'school_amethyst', label: label(ICON.balloon, 'Primaire Am\u00e9thyste') },
            { id: 'school_opal', label: label(ICON.teddy, 'Maternelle Opale') }
        ]
    },
    {
        title: 'Star Rank',
        tags: [
            { id: 'rank_0', label: label(ICON.star, 'Sans \u00e9toile') },
            { id: 'rank_1', label: label(ICON.star, 'Simple') },
            { id: 'rank_2', label: label(ICON.star, 'Double') },
            { id: 'rank_3', label: label(ICON.star, 'Triple') },
            { id: 'rank_major', label: label(ICON.glow, 'Major') }
        ]
    },
    {
        title: 'Identity',
        tags: [
            { id: 'identity_meister', label: label(ICON.dna, 'Meister') },
            { id: 'identity_weapon', label: label(ICON.skull, 'Weapon') },
            { id: 'identity_alice', label: label(ICON.fire, 'Alice') },
            { id: 'identity_witch', label: label(ICON.crystal, 'Sorci\u00e8re / Sorcier') },
            { id: 'identity_none', label: label(ICON.pinch, 'Sans Particularit\u00e9s') }
        ]
    },
    {
        title: 'Weapon Type',
        tags: [
            { id: 'weapon_simple', label: label(ICON.dagger, 'Arme simple') },
            { id: 'weapon_twins', label: label(ICON.swords, 'Armes jumel\u00e9es') },
            { id: 'weapon_multi', label: label(ICON.hammer, 'Arme multi-formes') }
        ]
    },
    {
        title: 'Alice Type',
        tags: [
            { id: 'alice_simple', label: label(ICON.sparkles, 'Simple Alice') },
            { id: 'alice_double', label: label(ICON.dizzy, 'Double Alice') },
            { id: 'alice_physical', label: label(ICON.gear, 'Type Physiques') },
            { id: 'alice_psychic', label: label(ICON.candle, 'Type Psychiques') },
            { id: 'alice_tech', label: label(ICON.testTube, 'Type Technologiques') },
            { id: 'alice_special', label: label(ICON.broccoli, 'Type Sp\u00e9ciaux') },
            { id: 'alice_danger', label: label(ICON.bomb, 'Type Dangereux') },
            { id: 'alice_child', label: label(ICON.teddy, 'Forme Enfance') },
            { id: 'alice_diffuse', label: label(ICON.shower, 'Forme Diffuse') },
            { id: 'alice_unknown', label: label(ICON.antenna, 'Forme Ind\u00e9termin\u00e9e') },
            { id: 'alice_limited', label: label(ICON.coffin, 'Forme Limit\u00e9e') }
        ]
    },
    {
        title: 'Kingdom',
        tags: [
            { id: 'kingdom_ombresyl', label: label(ICON.bat, 'Ombresyl') },
            { id: 'kingdom_sancturia', label: label(ICON.sprout, 'Sancturia') },
            { id: 'kingdom_luminara', label: label(ICON.crown, 'Luminara') },
            { id: 'kingdom_celestheon', label: label(ICON.swan, 'Celestheon') }
        ]
    },
    {
        title: 'Hierarchy',
        tags: [
            { id: 'hierarchy_regent', label: label(ICON.crown, 'Hi\u00e9rarchie - Lign\u00e9e r\u00e9gente') },
            { id: 'hierarchy_clergy', label: label(ICON.bright, 'Hi\u00e9rarchie - Clerg\u00e9') },
            { id: 'hierarchy_high_nobility', label: label(ICON.castle, 'Hi\u00e9rarchie - Haute-Noblesse') },
            { id: 'hierarchy_low_nobility', label: label(ICON.shield, 'Hi\u00e9rarchie - Petite-Noblesse') },
            { id: 'hierarchy_army', label: label(ICON.swords, 'Hi\u00e9rarchie - Force Arm\u00e9e') },
            { id: 'hierarchy_bourgeoisie', label: label(ICON.coin, 'Hi\u00e9rarchie - Bourgeoisie') },
            { id: 'hierarchy_peasantry', label: label(ICON.wheat, 'Hi\u00e9rarchie - Paysannerie') },
            { id: 'hierarchy_low_people', label: label(ICON.hole, 'Hi\u00e9rarchie - Bas Peuple') },
            { id: 'hierarchy_slaves', label: label(ICON.chains, 'Hi\u00e9rarchie - Esclaves & Hybrides') }
        ]
    },
    {
        title: 'Gender',
        tags: [
            { id: 'gender_f', label: label(ICON.purple, 'F\u00e9minin') },
            { id: 'gender_m', label: label(ICON.blue, 'Masculin') }
        ]
    }
];

const TAG_LABEL_BY_ID = TAG_GROUPS.reduce((acc, group) => {
    for (const tag of group.tags) acc[tag.id] = tag.label;
    return acc;
}, {});

export function initProfileTagSelector({ characterId }) {
    const toggle = document.getElementById('tagToggle');
    const dropdown = document.getElementById('tagDropdown');
    const selected = document.getElementById('selectedTags');
    const wrapper = document.getElementById('profileTags');

    if (!toggle || !dropdown || !selected || !wrapper) return;

    const enabled = !!characterId;
    toggle.disabled = !enabled;
    toggle.title = enabled ? '' : 'Sélectionnez un personnage pour modifier les tags';

    let selectedIds = enabled ? loadSelected(characterId) : [];

    const isOpen = () => !dropdown.hidden;
    const setOpen = (open) => {
        dropdown.hidden = !open;
        toggle.textContent = open ? '−' : '+';
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    function renderDropdown() {
        dropdown.innerHTML = '';
        for (const group of TAG_GROUPS) {
            const groupEl = document.createElement('div');
            groupEl.className = 'profile-tags-group';

            const title = document.createElement('div');
            title.className = 'profile-tags-group-title';
            title.textContent = group.title;

            groupEl.appendChild(title);

            for (const tag of group.tags) {
                const labelEl = document.createElement('label');
                labelEl.className = 'profile-tags-option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = tag.id;
                checkbox.checked = selectedIds.includes(tag.id);

                const text = document.createElement('span');
                text.className = 'profile-tags-option-label';
                text.textContent = tag.label;

                labelEl.append(checkbox, text);
                groupEl.appendChild(labelEl);
            }

            dropdown.appendChild(groupEl);
        }
    }

    function renderSelected() {
        selected.innerHTML = '';
        if (!selectedIds.length) {
            const hint = document.createElement('span');
            hint.className = 'profile-tags-empty';
            hint.textContent = enabled ? 'Aucun tag sélectionné.' : '—';
            selected.appendChild(hint);
            return;
        }

        for (const id of selectedIds) {
            const badge = document.createElement('span');
            badge.className = 'profile-tags-badge';

            const labelText = document.createElement('span');
            labelText.className = 'profile-tags-badge-label';
            labelText.textContent = TAG_LABEL_BY_ID[id] || id;

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'profile-tags-badge-remove';
            remove.textContent = '×';
            remove.title = 'Retirer';
            remove.addEventListener('click', () => {
                selectedIds = selectedIds.filter((x) => x !== id);
                saveSelected(characterId, selectedIds);
                const checkbox = dropdown.querySelector(`input[type="checkbox"][value="${CSS.escape(id)}"]`);
                if (checkbox) checkbox.checked = false;
                renderSelected();
            });

            badge.append(labelText, remove);
            selected.appendChild(badge);
        }
    }

    function syncFromDropdown() {
        const checked = Array.from(dropdown.querySelectorAll('input[type="checkbox"]:checked')).map((i) => i.value);
        selectedIds = checked;
        saveSelected(characterId, selectedIds);
        renderSelected();
    }

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (!enabled) return;
        setOpen(!isOpen());
    });

    dropdown.addEventListener('change', (e) => {
        if (e.target && e.target.matches('input[type="checkbox"]')) {
            syncFromDropdown();
        }
    });

    // Close only on explicit actions (click outside / Escape)
    document.addEventListener('pointerdown', (e) => {
        if (!isOpen()) return;
        if (!wrapper.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            e.preventDefault();
            setOpen(false);
            toggle.focus();
        }
    });

    renderDropdown();
    renderSelected();
    setOpen(false);
}

