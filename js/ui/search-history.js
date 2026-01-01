(function () {
    const helpers = window.astoriaSearchHistory || {};

    function readStorage(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    }

    function writeStorage(key, items) {
        try {
            localStorage.setItem(key, JSON.stringify(items));
        } catch (error) {
            // ignore storage failures
        }
    }

    function createSearchHistory(options) {
        const storageKey = options?.storageKey || "astoriaRecentSearches";
        const maxItems = Number.isFinite(options?.maxItems) ? options.maxItems : 5;
        const minLength = Number.isFinite(options?.minLength) ? options.minLength : 2;

        function get() {
            return readStorage(storageKey);
        }

        function save(query) {
            const value = String(query || "").trim();
            if (!value || value.length < minLength) return;

            let items = readStorage(storageKey);
            items = items.filter((item) => item !== value);
            items.unshift(value);
            items = items.slice(0, maxItems);
            writeStorage(storageKey, items);
        }

        function clear() {
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                // ignore storage failures
            }
        }

        return { get, save, clear };
    }

    function renderDropdown(container, items, options) {
        if (!container) return;
        container.innerHTML = "";

        const onSelect = options?.onSelect;
        const onClear = options?.onClear;
        const itemClass = options?.itemClass || "recent-search-item";
        const clearClass = options?.clearClass || "recent-search-item recent-search-item--clear";
        const clearLabel = options?.clearLabel || "Clear recent searches";

        (items || []).forEach((query) => {
            const item = document.createElement("div");
            item.className = itemClass;
            item.textContent = query;
            item.onmousedown = (event) => {
                event.preventDefault();
                if (typeof onSelect === "function") {
                    onSelect(query);
                }
            };
            container.appendChild(item);
        });

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.className = clearClass;
        clearButton.textContent = clearLabel;
        clearButton.onmousedown = (event) => {
            event.preventDefault();
            if (typeof onClear === "function") {
                onClear();
            }
        };
        container.appendChild(clearButton);
    }

    helpers.createSearchHistory = createSearchHistory;
    helpers.renderDropdown = renderDropdown;
    window.astoriaSearchHistory = helpers;
})();
