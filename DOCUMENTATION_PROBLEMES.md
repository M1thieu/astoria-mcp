# Documentation des Problèmes - Site Astoria

## Date: 2026-01-29

---

## 1. Architecture de la Base de Données

### profile_data (JSONB) - Problème Majeur

**Symptôme:** Toutes les données du personnage sont dans un seul champ JSONB

**Contenu actuel:**
```javascript
{
  competences: {
    version: 1,
    pointsByCategory: { arts: 75, ... },
    allocationsByCategory: { arts: {...}, ... },
    baseValuesByCategory: { arts: {...}, ... },
    locksByCategory: { arts: false, ... },
    customSkillsByCategory: { arts: [], ... }
  },
  inventory: { /* items */ },
  magic_sheet: { /* pages et capacités */ },
  identite: { /* champs de fiche */ },
  appartenance: { /* champs de fiche */ },
  combat: { /* champs de fiche */ },
  alice: { /* champs de fiche */ },
  sorcellerie: { /* champs de fiche */ },
  eater: { /* champs de fiche */ },
  religion: { /* champs de fiche */ },
  mental: { /* champs de fiche */ },
  physique: { /* champs de fiche */ },
  background: { /* champs de fiche */ }
}
```

**Impacts:**
- ❌ Impossibilité de requêter efficacement
- ❌ Modification = réécriture complète du JSONB
- ❌ Aucune validation de schéma
- ❌ Difficile pour les admins de modifier des champs
- ❌ Performance dégradée avec la croissance des données

**Solution:** Voir [PLAN_RESTRUCTURATION_PROFILE_DATA.md](PLAN_RESTRUCTURATION_PROFILE_DATA.md)

---

## 2. Système de Prix (RÉSOLU ✅)

### price_po / price_pa → price_kaels

**Problème:** Système de prix confus avec "po" (pièces d'or?) et "pa" (pièces d'argent?) alors que la monnaie est les "kaels"

**Fichiers concernés:**
- ❌ `supabase-schema.sql` (colonnes price_po, price_pa)
- ❌ `js/hdv.js` (buyPrice, sellPrice)
- ❌ `js/codex.js` (affichage "po"/"pa")
- ❌ `js/codex-admin.js` (création items)
- ❌ `js/quetes.js` (récompenses)
- ❌ `inventaire.html` (affichage prix)

**Solution appliquée (Commit 708fd5c):**
- ✅ Migration SQL créée: `supabase/migrations/migrate_prices_to_kaels.sql`
- ✅ Schéma mis à jour avec `price_kaels`
- ✅ Tous les fichiers JS utilisent maintenant `price` et affichent "kaels"
- ⚠️ **ACTION REQUISE:** Exécuter la migration SQL dans Supabase

---

## 3. CSS et Classes Fantômes

### Classes tw-btn inexistantes

**Problème:** Classes `tw-btn` et `tw-btn-ghost` utilisées partout mais jamais définies dans le CSS

**Fichiers concernés:**
- ❌ `profil.html`
- ❌ `magie.html`
- ❌ `hdv.html`
- ❌ `inventaire.html`
- ❌ `login.html`
- ❌ `index.html`
- ❌ `codex.html`

**Solution appliquée (Commit 086ce31):**
- ✅ Suppression de toutes les classes fantômes
- ✅ Utilisation des classes existantes (btn-primary, btn-secondary, etc.)

---

## 4. Z-index et Superposition UI

### Quest Rewards Dropdown

**Problème:** Le dropdown des récompenses dans la création de quêtes se superposait mal avec la description

**Fichier:** `css/quetes.css`

**Solution appliquée (Commit 44d2972):**
```css
.quest-reward-picker {
    z-index: 50;  /* Ajouté */
}
.quest-reward-popover {
    z-index: 100;  /* Augmenté de 40 à 100 */
}
```

### Quest Modal Background

**Problème:** Le fond flouté du modal de quête n'était pas visible

**Cause:** Classe `tw-surface` ajoutant un fond blanc semi-transparent par-dessus le blur

**Solution appliquée (Commit 086ce31):**
- ✅ Suppression de `tw-surface` sur `.quest-modal-scrim`

---

## 5. Boutons et Visibilité

### Bouton Modifier dans Quest Modal

**Problème:** Le bouton "Modifier" n'apparaissait que sur hover au lieu d'être toujours visible

**Cause:** CSS forçant `visibility: visible` qui overridait l'attribut `hidden`

**Solution appliquée (Commit 086ce31):**
```css
#questEditBtn[hidden] {
    display: none !important;
}
```

---

## 6. Système de Compétences

### Points par Défaut

**Valeurs correctes (ne pas modifier):**
```javascript
const DEFAULT_CATEGORY_POINTS = {
    arts: 75,
    connaissances: 75,
    combat: 25,
    pouvoirs: 5,
    social: 75,
    artisanat: 10,
    nature: 60,
    physique: 55,
    reputation: 25
};
```

### Kaels de Départ

**Valeur correcte:** `0` (les admins distribuent les kaels manuellement)

**Erreur commise:** Changé à 5000 par erreur, puis corrigé (Commit e766f6b)

---

## 7. Panel Admin

**État:** Besoin d'amélioration (non détaillé)

**Problèmes mentionnés:**
- Interface peu claire
- Difficile de modifier certains champs
- Manque de fonctionnalités

**À faire:**
- Audit complet du panel admin
- Liste des améliorations souhaitées
- Priorisation des changements

---

## 8. RLS Policies et Auth Custom

### Système d'authentification non-standard

**Architecture actuelle:**
- Table `users` custom (pas Supabase Auth)
- Auth stockée dans localStorage
- RLS policies permissives (`true`)

**Raison:** Prototype rapide, pas de temps de configurer Supabase Auth proprement

**Conséquences:**
- ⚠️ Sécurité réduite (RLS ne filtre pas vraiment)
- ⚠️ Pas de sessions gérées côté serveur
- ⚠️ Token dans localStorage peut être volé

**Amélioration future:**
- Migrer vers Supabase Auth
- Utiliser auth.uid() dans les policies
- Sessions gérées proprement

---

## 9. Migrations SQL

### Fichiers de migration

**Localisation:** `supabase/migrations/`

**Migrations existantes:**
1. ✅ `create_quests_tables.sql` - Tables quests et quest_history
2. ✅ `create_nokorahs_table.sql` - Table nokorahs (RLS mis à jour)
3. ⚠️ `migrate_prices_to_kaels.sql` - **À EXÉCUTER dans Supabase**

**Processus:**
1. Écrire la migration localement
2. Tester sur un backup de la DB
3. Exécuter dans Supabase SQL Editor
4. Vérifier les données
5. Commenter les anciennes colonnes

---

## 10. Structure des Fichiers

### Organisation actuelle

```
astoria/
├── css/              # Styles (nombreux fichiers spécifiques)
├── js/
│   ├── api/         # Services Supabase
│   ├── panels/      # Panels (admin, etc.)
│   ├── ui/          # Composants UI réutilisables
│   └── *.js         # Scripts spécifiques aux pages
├── assets/          # Images, icons, etc.
├── supabase/
│   └── migrations/  # Migrations SQL
└── *.html           # Pages du site
```

**Problèmes:**
- Fichiers très longs (js/magie.js, js/quetes.js, etc.)
- Beaucoup de duplication de code
- Manque de modularité

**Améliorations possibles:**
- Extraire composants réutilisables
- Service layer plus structuré
- Build system pour bundler et minifier

---

## Résumé des Actions Immédiates

### Urgent
1. ⚠️ **Exécuter la migration SQL des prix dans Supabase**
2. ⚠️ **Choisir option de restructuration profile_data** (voir plan)

### Court terme (1-2 semaines)
3. Commencer la migration progressive de profile_data
4. Améliorer le panel admin
5. Audit complet des z-index dans tout le site

### Moyen terme (1 mois)
6. Migrer vers Supabase Auth
7. Refactoring des gros fichiers JS
8. Tests automatisés

### Long terme (2-3 mois)
9. Build system et optimisations
10. Documentation complète du code
11. Mobile-responsive improvements

---

## État Général du Site

### ✅ Points Forts
- Design cohérent et agréable
- Fonctionnalités riches (compétences, quêtes, inventaire, magie, nokorah)
- Base de données Supabase bien configurée
- Git workflow propre

### ⚠️ Points à Améliorer
- Architecture de données (profile_data)
- Sécurité (auth custom)
- Modularité du code
- Performance (JSONB updates)
- Documentation

### ❌ Problèmes Critiques
- Aucun! Le site fonctionne, juste besoin de refactoring progressif

---

## Conclusion

**Le site est récupérable à 100%!**

Les problèmes actuels sont normaux pour un projet en développement rapide. Aucun n'est bloquant, ce sont principalement des dettes techniques à rembourser progressivement.

**Recommandation:** Migration progressive (Option 2) pour réduire les risques tout en améliorant l'architecture.
