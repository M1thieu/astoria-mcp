# Dynamic Inventory System - Implementation Guide

## What Changed

Your inventory page (`inventaire.html`) is now **fully dynamic** and loads from existing data:

### 1. Loads from data.js
- All items from `inventoryData` (data.js) are loaded automatically
- Every item appears with all its native data (name, description, image, effect, prices)
- No manual entry needed - items come from your existing database

### 2. Smart Quantity System
- Each item starts with quantity: 1
- Quantities are saved to localStorage
- Item data always comes fresh from data.js

### 3. Smart Image Resolution
- Uses existing image paths from data.js
- Centralized `IMAGE_CONFIG` for all image mappings
- Supports multiple input formats (name, filename, URL)
- Automatic fallback to placeholder if image fails

### 4. localStorage for Quantities Only
- Saves only quantities, not full item data
- Item data (names, descriptions, etc.) always pulled from data.js
- Keeps inventory in sync with your master data

---

## How to Use

### Viewing Items

- **Open inventaire.html** - All items from data.js load automatically
- **Filter by category** - Click category buttons to filter
- **View details** - Click any item to see full info in right panel
- **Quantities** - Each item shows "×N" if quantity > 1

### Filtering by Category

- Click any category button at the top
- Grid filters to show only that category
- Item count updates to show filtered count
- Click "Tous" to see everything

### Viewing Item Details

- Click any item card in the grid
- Right panel shows full details
- Selected item has a visual highlight

---

## Image System

### How Images Are Resolved

The system tries multiple methods to find your image:

1. **Direct URL**: If you enter `http://...` or `https://...`, uses that
2. **Direct Filename**: If you enter `MyImage.png`, looks in `assets/images/MyImage.png`
3. **Name Mapping**: If you enter `Armure de Vexarion`, normalizes it and looks in `IMAGE_CONFIG.mappings`
4. **Item Name**: If image field is empty, tries to match item name to mappings
5. **Placeholder**: If all else fails, shows a placeholder "?" icon

### Adding New Image Mappings

Edit `inventaire.html` and find the `IMAGE_CONFIG` section:

```javascript
const IMAGE_CONFIG = {
    basePath: 'assets/images/',
    mappings: {
        'armuredevexarion': 'Armure_de_Vexarion.png',
        'mynewitem': 'My_New_Item.jpg',
        // Add more here...
    }
};
```

**Key rules:**
- Keys must be lowercase, no spaces, no special chars
- Values are relative to `basePath`
- Normalize your item name: `"Mon Épée!" → "monepee"`

### Image Input Examples

When adding an item, you can enter:

| Input | Result |
|-------|--------|
| `Armure de Vexarion` | Finds in mappings → `assets/images/Armure_de_Vexarion.png` |
| `MyCustom.jpg` | Direct filename → `assets/images/MyCustom.jpg` |
| `https://example.com/pic.png` | Direct URL → Uses external URL |
| (empty) | Uses item name for lookup |

---

## localStorage

### Storage Structure

Only **quantities** are stored, not full item data:

```json
{
  "armuredevexarion": 2,
  "sceptredekrythus": 1,
  "veillenuit": 5
}
```

Item keys are normalized (lowercase, no special chars).

### Storage Key

Quantities saved under: `astoriaInventoryQuantities`

### Managing Data

Open browser console:

```javascript
// Update quantity for an item
InventoryModule.updateQuantity("Armure de Vexarion", 5);

// Reset all quantities to 1
InventoryModule.resetQuantities();

// Reload from data.js (discards localStorage)
InventoryModule.reloadFromData();

// Clear localStorage manually
localStorage.removeItem('astoriaInventoryQuantities');
```

---

## API for External Integration

The inventory exposes `window.InventoryModule` with these functions:

### Get Current Items

```javascript
const items = InventoryModule.items();
console.log(items); // Array of all items with quantities
```

### Update Item Quantity

```javascript
// Change quantity for a specific item
InventoryModule.updateQuantity("Armure de Vexarion", 3);

// Set to 0 to "remove" (item stays but quantity = 0)
InventoryModule.updateQuantity("Potion", 0);
```

### Reset All Quantities

```javascript
// Reset all items to quantity: 1
InventoryModule.resetQuantities(); // Shows confirmation
```

### Reload from data.js

```javascript
// Discard localStorage and reload from data.js
InventoryModule.reloadFromData();
```

### Filter by Category

```javascript
InventoryModule.filterByCategory('equipement');
InventoryModule.filterByCategory('all'); // Show all
```

### Re-render

```javascript
InventoryModule.renderInventory(); // Refresh the display
```

---

## Code Structure

### Main Sections in inventaire.html

1. **CONFIGURATION** (lines ~79-118)
   - `IMAGE_CONFIG`: Image path mappings
   - `PLACEHOLDER_IMAGE`: SVG fallback

2. **STATE** (lines ~120-128)
   - `inventoryItems`: Array of items (loaded from data.js)
   - `currentCategory`: Active filter
   - `selectedItemIndex`: Selected item
   - `nextItemId`: Tracks item count

3. **INITIALIZATION** (lines ~143-161)
   - `initInventory()`: Main entry point
   - Loads from data.js via `loadFromDataJS()`

4. **PERSISTENCE** (lines ~163-226)
   - `loadFromDataJS()`: Load items from inventoryData
   - `saveQuantitiesToStorage()`: Save only quantities

5. **CATEGORY FILTERING** (lines ~228-250)
   - `filterByCategory(category)`: Filter & re-render
   - Category button click handlers

6. **IMAGE RESOLUTION** (lines ~252-297)
   - `resolveImage(item)`: Smart image path resolution

7. **RENDERING** (lines ~299-372)
   - `renderInventory()`: Main render function
   - `createItemCard(item)`: Create item card element

8. **SELECTION & DETAILS** (lines ~374-463)
   - `selectItem(item)`: Handle item click
   - `showItemDetail(item)`: Show details panel
   - `showDetailPlaceholder()`: Default state

9. **API** (lines ~487-540)
   - `window.InventoryModule`: Exposed functions

---

## CSS Structure (style.css)

New styles added starting at line ~1021:

- `.add-item-btn`: The "+" button
- `.add-panel`: Slide-in panel (fixed positioning)
- `.add-panel.open`: Panel visible state
- `.form-group`: Form field containers
- `.quantity-control`: Quantity +/- control
- `.qty-btn`: Quantity buttons
- `.btn-primary` / `.btn-secondary`: Action buttons

**Mobile responsive** (lines ~1286-1297):
- Panel becomes full-width on mobile
- "Ajouter" label hides, shows only "+" icon

---

## How to Connect with index.html

### Option 1: Direct Link
Add a navigation link in index.html:

```html
<a href="inventaire.html" class="inventory-link">
    📦 Inventaire
</a>
```

### Option 2: Update Quantities from index.html

If you want to change quantities from index.html (e.g., when "using" an item):

```javascript
// Update quantity in localStorage
function useItem(itemName) {
    // Load current quantities
    const stored = localStorage.getItem('astoriaInventoryQuantities');
    const quantities = stored ? JSON.parse(stored) : {};

    // Normalize item name
    const itemKey = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Decrease quantity
    const current = quantities[itemKey] || 1;
    quantities[itemKey] = Math.max(0, current - 1);

    // Save back
    localStorage.setItem('astoriaInventoryQuantities', JSON.stringify(quantities));

    console.log(`Used ${itemName}, quantity now: ${quantities[itemKey]}`);
}
```

### Option 3: Sync Between Pages

Since both pages use the same localStorage key, they stay in sync automatically. Just reload inventaire.html to see updated quantities.

---

## Testing Checklist

1. ✅ Open `inventaire.html` → All items from data.js load
2. ✅ Check console → "Loaded X items from data.js"
3. ✅ Click category button → Grid filters correctly
4. ✅ Click item → Details show on right with full info
5. ✅ Check quantities → All items show quantity (default: 1)
6. ✅ Update quantity via console → `InventoryModule.updateQuantity("Armure de Vexarion", 3)`
7. ✅ Refresh page → Quantity persists (localStorage)
8. ✅ Check images → All images load correctly or show placeholder
9. ✅ Filter by Équipements → Only equipement items show
10. ✅ Resize to mobile → Layout adapts correctly

---

## Troubleshooting

### No Items Loading

1. Check browser console for errors
2. Verify `data.js` is loaded before inventaire.html script
3. Check that `inventoryData` is defined in data.js
4. Run in console: `console.log(inventoryData)`

### Images Not Loading

1. Check `IMAGE_CONFIG.basePath` is correct (`assets/images/`)
2. Verify image files exist in that folder
3. Check browser console for 404 errors
4. Check image paths in data.js match files

### Quantities Not Persisting

1. Check browser console for localStorage errors
2. Verify localStorage is enabled
3. Run: `localStorage.getItem('astoriaInventoryQuantities')`
4. Should see JSON with quantities

### Items Show Old Data

- Clear localStorage: `InventoryModule.reloadFromData()`
- Or manually: `localStorage.removeItem('astoriaInventoryQuantities')`
- Refresh page - should load fresh from data.js

### Wrong Item Count

- Count shows **filtered count** (current category)
- Switch to "Tous" to see total count

---

## Future Enhancements

Possible additions (not implemented yet):

1. **Edit Existing Items**: Click item to edit, not just view
2. **Delete Items**: Add trash icon to item cards or details panel
3. **Drag & Drop**: Reorder items in grid
4. **Grid Positioning**: Wasteland 3-style Tetris inventory
5. **Item Stacking**: Auto-merge items with same name
6. **Export/Import**: Download inventory as JSON
7. **Search/Filter**: Search bar for item names
8. **Sorting**: Sort by name, category, quantity
9. **Item Actions**: Use, equip, drop buttons
10. **Bulk Operations**: Select multiple items

---

## Summary

Your inventory is now:
- ✅ **Loads from data.js** - All items automatically loaded
- ✅ **Smart Quantities** - Tracks quantities via localStorage
- ✅ **Always in Sync** - Item data always fresh from data.js
- ✅ **Smart Images** - Flexible image resolution with fallbacks
- ✅ **API Ready** - Can integrate with index.html
- ✅ **Responsive** - Works on mobile
- ✅ **Well Commented** - Easy to modify

All your existing visual design is preserved. The pink theme, category icons, grid layout, and detail panel all look exactly the same. Now the inventory shows ALL your items from data.js with native data—no manual entry needed!

---

## Quick Reference

**Data Source**: `inventoryData` from data.js
**Storage Key**: `astoriaInventoryQuantities` (quantities only)
**API**: `window.InventoryModule`
**Images Config**: Line ~86 in inventaire.html
**Update Quantity**: `InventoryModule.updateQuantity(name, qty)`
**Reset All**: `InventoryModule.resetQuantities()`
**Reload Fresh**: `InventoryModule.reloadFromData()`
