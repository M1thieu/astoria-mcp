# 🔍 Diagnostic HDV - Problème d'authentification

## Symptôme
Sur GitHub Pages, la page HDV affiche "Se connecter" alors que l'utilisateur est connecté sur toutes les autres pages (index, profil, fiche, magie).

## Architecture actuelle

### Flux d'authentification HDV
1. **hdv.html** charge deux modules :
   - `js/ui/app-shell.js` (topbar universelle)
   - `js/hdv.js` (logique HDV)

2. **js/hdv.js** :
   - Importe `getCurrentUser()` et `getActiveCharacter()` depuis `./auth.js`
   - Fonction `resolveCurrentUser()` (ligne 71-82) avec double fallback :
     - Essaie d'abord `getCurrentUser()` depuis le module importé
     - Si échec, lit directement `localStorage.getItem('astoria_session')`
   - Fonction `refreshProfile()` (ligne 553-600) :
     - Appelle `resolveCurrentUser()` et `resolveActiveCharacter()`
     - Si `state.user` est null → affiche "Se connecter" (ligne 562)

3. **js/ui/app-shell.js** :
   - Importe dynamiquement `../auth.js`
   - Si `getCurrentUser()` retourne null → retourne silencieusement (ligne 82)
   - Ne crée pas la topbar

## Étapes de diagnostic

### 1. Tester la page de diagnostic

Ouvrir `debug-storage.html` dans le navigateur sur GitHub Pages :

```bash
# Sur votre navigateur, testez ces URLs dans l'ordre :
https://<votre-username>.github.io/<repo-name>/login.html     # Se connecter d'abord
https://<votre-username>.github.io/<repo-name>/index.html     # Vérifier que ça marche
https://<votre-username>.github.io/<repo-name>/debug-storage.html  # Diagnostic
https://<votre-username>.github.io/<repo-name>/hdv.html       # Page problématique
```

### 2. Vérifier les points suivants

Dans la console de chaque page (F12), exécuter :

```javascript
// 1. Vérifier l'origin
console.log('Origin:', location.origin);
console.log('URL:', location.href);

// 2. Vérifier localStorage
console.log('Session:', localStorage.getItem('astoria_session'));
console.log('Character:', localStorage.getItem('astoria_active_character'));

// 3. Test import module (uniquement sur hdv.html)
import('./js/auth.js').then(auth => {
  console.log('getCurrentUser:', auth.getCurrentUser ? auth.getCurrentUser() : 'undefined');
  console.log('getActiveCharacter:', auth.getActiveCharacter ? auth.getActiveCharacter() : 'undefined');
});
```

### 3. Comparer index.html vs hdv.html

**Sur index.html** (fonctionne ✓) :
- Origin: ?
- localStorage session: ?
- getCurrentUser(): ?

**Sur hdv.html** (ne fonctionne pas ✗) :
- Origin: ?
- localStorage session: ?
- getCurrentUser(): ?

## Causes probables

### Cause 1 : Origin différent (le plus probable)
Si les URLs sont différentes entre les pages :
- `https://username.github.io/astoria/index.html` ✓
- `https://username.github.io/astoria-hdv/hdv.html` ✗

→ localStorage est isolé par origin, donc session différente

**Solution** : Unifier les URLs, toutes les pages doivent être sur le même origin.

### Cause 2 : Problème de timing module
Le module `js/hdv.js` s'exécute avant que `refreshSessionUser()` ait mis à jour la session.

**Solution** : Forcer un refresh après import.

### Cause 3 : Session expirée uniquement sur HDV
La vérification `isExpired(session)` retourne true sur HDV mais pas ailleurs.

**Solution** : Augmenter `SESSION_MAX_AGE_MS` ou débugger le timestamp.

### Cause 4 : Conflit entre app-shell.js et hdv.js
Les deux modules importent `auth.js` et peuvent avoir des versions différentes de la session en cache mémoire.

**Solution** : Synchroniser les modules ou utiliser un seul point d'entrée.

## Solutions proposées

### Solution A : Fix rapide localStorage (recommandé pour test)

Modifier `js/hdv.js` ligne 71-82 pour logger et forcer le fallback :

```javascript
function resolveCurrentUser() {
    console.log('[HDV] resolveCurrentUser appelé');

    // Toujours vérifier localStorage en premier
    try {
        const raw = localStorage.getItem('astoria_session');
        console.log('[HDV] localStorage astoria_session:', raw ? 'EXISTE' : 'NULL');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.user && parsed.user.id) {
                console.log('[HDV] User trouvé dans localStorage:', parsed.user.username);
                return parsed.user;
            }
        }
    } catch (err) {
        console.error('[HDV] Erreur lecture localStorage:', err);
    }

    // Fallback sur getCurrentUser()
    const direct = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    console.log('[HDV] getCurrentUser():', direct ? direct.username : 'NULL');
    if (direct && direct.id) return direct;

    console.error('[HDV] Aucun user trouvé !');
    return null;
}
```

### Solution B : Forcer refresh session au début

Modifier `js/hdv.js` init() ligne 991-999 :

```javascript
// Forcer refresh AVANT de lire la session
if (typeof refreshSessionUser === 'function') {
    try {
        console.log('[HDV] Refresh session...');
        const result = await refreshSessionUser();
        console.log('[HDV] Refresh result:', result);

        // Attendre un peu pour que localStorage soit écrit
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
        console.error('[HDV] Refresh error:', err);
    }
}
```

### Solution C : Supprimer app-shell.js de HDV (nuclear option)

Si app-shell.js cause un conflit, retirer temporairement de hdv.html :

```html
<!-- <script type="module" src="js/ui/app-shell.js"></script> -->
<script type="module" src="js/hdv.js"></script>
```

Tester si HDV fonctionne sans app-shell.

### Solution D : Debug complet avec breakpoints

Ajouter des console.log partout pour tracer le flux :

1. `js/api/session-store.js` ligne 20 → `readSession()`
2. `js/api/auth-service.js` ligne 130 → `getCurrentUser()`
3. `js/hdv.js` ligne 71 → `resolveCurrentUser()`
4. `js/hdv.js` ligne 554 → `refreshProfile()`

## Actions immédiates

1. ✅ Créer et tester `debug-storage.html` sur GitHub Pages
2. ⬜ Noter les résultats (origin, localStorage, modules)
3. ⬜ Comparer index.html vs hdv.html
4. ⬜ Identifier la cause parmi les 4 possibles
5. ⬜ Appliquer la solution correspondante

## Résultats attendus

Après diagnostic, on devrait savoir :
- ✅ ou ✗ : localStorage est identique sur toutes les pages ?
- ✅ ou ✗ : origin est identique ?
- ✅ ou ✗ : modules s'importent correctement ?
- ✅ ou ✗ : session existe et est valide ?

→ Cela guidera vers la bonne solution.
