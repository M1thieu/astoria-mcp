# 🔧 Fix HDV Authentication - Guide Complet

## 📋 Résumé du problème

Sur **GitHub Pages uniquement**, la page HDV affiche "Se connecter" alors que l'utilisateur est correctement authentifié sur toutes les autres pages (index, profil, fiche, magie).

## ✅ Modifications appliquées

J'ai modifié **`js/hdv.js`** avec les corrections suivantes :

### 1. **Fonction `resolveCurrentUser()` (lignes 71-108)**
- ✨ **Nouveau** : Logs de debug complets
- ✨ **Nouveau** : Lecture de `localStorage` en PRIORITÉ 1 (avant `getCurrentUser()`)
- ✨ **Nouveau** : Vérification d'expiration de session intégrée
- ✨ **Nouveau** : Gestion d'erreurs explicite avec logs

### 2. **Fonction `resolveActiveCharacter()` (lignes 110-140)**
- ✨ **Nouveau** : Logs de debug
- ✨ **Nouveau** : Lecture de `localStorage` en PRIORITÉ 1
- ✨ **Nouveau** : Gestion d'erreurs avec logs

### 3. **Fonction `init()` (lignes 1027-1065)**
- ✨ **Nouveau** : Logs au démarrage (location, origin)
- ✨ **Nouveau** : Delay de 100ms après `refreshSessionUser()` pour laisser localStorage se synchroniser
- ✨ **Nouveau** : Vérification localStorage après refresh

## 🚀 Étapes de test

### Étape 1 : Test en local (recommandé)

1. **Ouvrir avec Live Server** (VS Code) ou serveur local
2. **Se connecter** via `login.html`
3. **Ouvrir la console** (F12) et naviguer vers `hdv.html`
4. **Vérifier les logs** :

```
[HDV] ========== INIT HDV ==========
[HDV] Location: http://localhost:5500/hdv.html
[HDV] Origin: http://localhost:5500
[HDV] Tentative refreshSessionUser...
[HDV] refreshSessionUser result: { success: true, ... }
[HDV] Après refresh - Session: true | Character: true
[HDV] resolveCurrentUser - location: http://localhost:5500/hdv.html
[HDV] localStorage astoria_session: ✓ EXISTE
[HDV] ✅ User trouvé via localStorage: VotreUsername
[HDV] resolveActiveCharacter appelé
[HDV] localStorage astoria_active_character: ✓ EXISTE
[HDV] ✅ Character trouvé via localStorage: VotrePersonnage
```

5. **Si vous voyez "✅ User trouvé"** → Le fix fonctionne en local ✓
6. **Si vous voyez "❌ AUCUN USER"** → Continuer au diagnostic ci-dessous

### Étape 2 : Test sur GitHub Pages

1. **Commiter et pusher** les modifications :

```bash
git add js/hdv.js
git commit -m "Fix: HDV authentication avec logs debug"
git push origin main
```

2. **Attendre** le déploiement GitHub Pages (1-2 minutes)

3. **Naviguer** vers :
   - `https://<username>.github.io/<repo>/login.html` → Se connecter
   - `https://<username>.github.io/<repo>/index.html` → Vérifier que ça marche
   - `https://<username>.github.io/<repo>/hdv.html` → Tester HDV

4. **Ouvrir la console F12** et vérifier les logs `[HDV]`

5. **Si ça ne fonctionne toujours pas** → Utiliser l'outil de diagnostic ci-dessous

### Étape 3 : Diagnostic approfondi

Si le problème persiste sur GitHub Pages, ouvrir **`debug-storage.html`** :

```
https://<username>.github.io/<repo>/debug-storage.html
```

Cette page affichera :
- ✅ ou ❌ **URL et Origin**
- ✅ ou ❌ **Contenu de `localStorage.getItem('astoria_session')`**
- ✅ ou ❌ **Contenu de `localStorage.getItem('astoria_active_character')`**
- ✅ ou ❌ **Test import modules `js/auth.js`**
- 📋 **Liste complète de localStorage**

**Scénarios possibles** :

#### Scénario A : localStorage vide sur HDV uniquement
```
index.html  → localStorage: ✅ Session existe
hdv.html    → localStorage: ❌ NULL
```

**Cause** : Origin différent entre les pages
**Solution** : Vérifier les URLs - toutes doivent être sur le même domaine

#### Scénario B : Import module échoue
```
❌ Erreur import module
TypeError: Cannot read properties of undefined
```

**Cause** : Problème de path relatif `./auth.js`
**Solution** : Modifier l'import dans `js/hdv.js` ligne 1 :
```javascript
// Essayer avec path absolu
import { getCurrentUser, ... } from '/js/auth.js';
```

#### Scénario C : Session expirée
```
[HDV] ⚠️ Session expirée
```

**Cause** : Session > 7 jours
**Solution** : Se reconnecter sur `login.html`

#### Scénario D : localStorage existe mais module retourne null
```
[HDV] localStorage astoria_session: ✓ EXISTE
[HDV] ✅ User trouvé via localStorage: username
```

→ Dans ce cas, le fix devrait fonctionner car on lit localStorage en priorité !

## 🧪 Test rapide console

Sur **hdv.html**, ouvrir la console (F12) et exécuter :

```javascript
// Test 1 : Vérifier localStorage directement
console.log('Session:', localStorage.getItem('astoria_session'));
console.log('Character:', localStorage.getItem('astoria_active_character'));

// Test 2 : Vérifier origin
console.log('Origin:', location.origin);
console.log('URL:', location.href);

// Test 3 : Tester import module
import('./js/auth.js').then(auth => {
  console.log('Module importé:', auth);
  console.log('User:', auth.getCurrentUser ? auth.getCurrentUser() : 'undefined');
  console.log('Char:', auth.getActiveCharacter ? auth.getActiveCharacter() : 'undefined');
}).catch(err => console.error('Erreur import:', err));

// Test 4 : Forcer reload localStorage (si session existe mais ne s'affiche pas)
location.reload();
```

## 📊 Comparaison avant/après

### AVANT (version originale)
```javascript
function resolveCurrentUser() {
    // 1. Essaie getCurrentUser() en premier
    const direct = getCurrentUser();
    if (direct && direct.id) return direct;

    // 2. Fallback localStorage
    const raw = localStorage.getItem('astoria_session');
    // ...
}
```

**Problème** : Si `getCurrentUser()` retourne `null` à cause d'un problème de module/timing, le user n'est jamais trouvé même si localStorage est valide.

### APRÈS (version corrigée)
```javascript
function resolveCurrentUser() {
    console.log('[HDV] resolveCurrentUser appelé');

    // 1. Lit localStorage EN PREMIER (plus fiable)
    const raw = localStorage.getItem('astoria_session');
    if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.user && !isExpired(parsed)) {
            console.log('[HDV] ✅ User trouvé');
            return parsed.user;  // ← RETOURNE ICI si OK
        }
    }

    // 2. Seulement si localStorage vide/invalide
    const direct = getCurrentUser();
    // ...
}
```

**Avantage** : Même si `getCurrentUser()` échoue, si `localStorage` contient une session valide, l'utilisateur est authentifié ✅

## 🔍 Fichiers créés

1. **`debug-storage.html`** : Page de diagnostic complète
2. **`DIAGNOSTIC_HDV.md`** : Documentation détaillée du problème
3. **`fix-hdv-auth.patch.js`** : Patch de référence (non nécessaire, déjà appliqué)
4. **`README_FIX_HDV.md`** : Ce fichier

## 🎯 Prochaines étapes

1. ✅ **Tester en local** avec les nouveaux logs
2. ✅ **Pusher sur GitHub** et tester sur Pages
3. ✅ **Vérifier les logs console** sur hdv.html
4. ❓ **Si ça ne marche toujours pas** :
   - Utiliser `debug-storage.html`
   - Copier les résultats
   - Identifier la cause exacte (origin/module/expiration)

## 🐛 Si le problème persiste

Fournir ces informations pour diagnostic :

```
1. URL GitHub Pages complète :
   - index.html : https://...
   - hdv.html : https://...

2. Résultat de debug-storage.html :
   - Origin : ...
   - Session dans localStorage : OUI / NON
   - Character dans localStorage : OUI / NON
   - Import module réussi : OUI / NON

3. Logs console sur hdv.html :
   [Copier les logs [HDV] ici]

4. Comportement :
   - Index fonctionne : OUI / NON
   - Profil fonctionne : OUI / NON
   - HDV fonctionne : OUI / NON
```

## 💡 Solutions alternatives

Si le fix actuel ne suffit pas :

### Option B : Désactiver app-shell.js temporairement

Dans `hdv.html` ligne 179, commenter :
```html
<!-- <script type="module" src="js/ui/app-shell.js"></script> -->
<script type="module" src="js/hdv.js"></script>
```

### Option C : Forcer re-login

Ajouter un bouton "Recharger session" qui réappelle `refreshSessionUser()` manuellement.

### Option D : Synchronisation cross-tab

Utiliser `window.addEventListener('storage', ...)` pour écouter les changements de localStorage.

---

**Auteur** : Claude Code
**Date** : 2025-12-29
**Status** : ✅ Fix appliqué, en attente de test sur GitHub Pages
