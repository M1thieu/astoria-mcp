# Plan de Restructuration - profile_data

## État Actuel

### Problèmes Identifiés

Le champ `profile_data` (JSONB) dans la table `characters` stocke actuellement:
- **Compétences** (pointsByCategory, allocationsByCategory, baseValuesByCategory, locksByCategory, customSkillsByCategory)
- **Inventaire** (inventory object)
- **Feuille de magie** (magic_sheet avec pages, capacités, stats alice/meister/arme)
- **Toutes les sections de fiche** (identite, appartenance, combat, alice, sorcellerie, eater, religion, mental, physique, background)

### Conséquences

1. **Performance**: Chaque mise à jour nécessite de réécrire tout le JSONB
2. **Requêtes**: Impossible de faire des requêtes SQL efficaces sur les compétences, l'inventaire, etc.
3. **Validation**: Aucune validation de schéma, risque d'incohérences
4. **Administration**: Difficile pour les admins de modifier des champs spécifiques
5. **Maintenance**: Code complexe pour manipuler la structure imbriquée
6. **Scalabilité**: Plus le JSONB grossit, plus les opérations sont lentes

---

## Option 1: Restructuration Complète (Recommandé)

### Tables à Créer

#### 1. Table `character_competences`
```sql
CREATE TABLE character_competences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('arts', 'connaissances', 'combat', 'pouvoirs', 'social', 'artisanat', 'nature', 'physique', 'reputation')),
    points_available INTEGER NOT NULL DEFAULT 0,
    allocations JSONB DEFAULT '{}'::jsonb,
    base_values JSONB DEFAULT '{}'::jsonb,
    is_locked BOOLEAN DEFAULT false,
    custom_skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id, category)
);
```

**Avantages**:
- Requêtes rapides par catégorie
- Index sur character_id et category
- Validation automatique des catégories
- Historique possible avec updated_at

#### 2. Table `character_inventory`
```sql
CREATE TABLE character_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(character_id, item_id)
);
```

**Avantages**:
- Relation directe avec la table items
- Comptage automatique des items
- Requêtes rapides pour "qui possède cet item?"
- Peut ajouter equipped, favorited, etc.

#### 3. Table `character_magic_pages`
```sql
CREATE TABLE character_magic_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    page_index INTEGER NOT NULL,
    page_name TEXT NOT NULL,
    affinity TEXT,
    scroll_eveil INTEGER DEFAULT 0,
    scroll_ascension INTEGER DEFAULT 0,
    alice_puissance INTEGER DEFAULT 0,
    alice_controle INTEGER DEFAULT 0,
    meister_souls INTEGER DEFAULT 0,
    meister_minor_fragments INTEGER DEFAULT 0,
    meister_ultimate_fragments INTEGER DEFAULT 0,
    arme_souls INTEGER DEFAULT 0,
    arme_minor_fragments INTEGER DEFAULT 0,
    arme_ultimate_fragments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id, page_index)
);
```

#### 4. Table `character_magic_capacities`
```sql
CREATE TABLE character_magic_capacities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    magic_page_id UUID NOT NULL REFERENCES character_magic_pages(id) ON DELETE CASCADE,
    capacity_name TEXT NOT NULL,
    capacity_type TEXT,
    rank TEXT,
    stats TEXT[],
    summary TEXT,
    target TEXT,
    zone_type TEXT,
    zone_detail TEXT,
    distance TEXT,
    activation_time TEXT,
    duration TEXT,
    cooldown TEXT,
    rp TEXT,
    perception TEXT,
    tell_sign TEXT,
    effect TEXT,
    conditions TEXT,
    strengths TEXT,
    weaknesses TEXT,
    cost TEXT,
    limits TEXT,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Table `character_nokorah`
```sql
CREATE TABLE character_nokorah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('commun', 'rare', 'epique', 'mythique', 'legendaire')),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 113),
    appearance_image TEXT,
    bonuses JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    farewell_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(character_id)
);
```

#### 6. Garder `profile_data` pour les sections de fiche
Pour les sections textuelles (identite, appartenance, alice, eater, etc.), on peut garder le JSONB car:
- Pas besoin de requêtes dessus
- Structure flexible pour le RP
- Chargement en bloc de toute façon

---

## Option 2: Migration Progressive (Plus Sûr)

### Phase 1: Extraire les compétences
1. Créer `character_competences`
2. Script de migration pour copier depuis profile_data.competences
3. Mettre à jour `js/competences.js` pour utiliser la nouvelle table
4. Garder profile_data.competences pendant 1 mois (sécurité)

### Phase 2: Extraire l'inventaire
1. Créer `character_inventory`
2. Migration depuis profile_data.inventory
3. Mettre à jour `js/inventaire.html`, `js/hdv.js`
4. Garder profile_data.inventory pendant 1 mois

### Phase 3: Extraire la magie
1. Créer `character_magic_pages` et `character_magic_capacities`
2. Migration depuis profile_data.magic_sheet
3. Mettre à jour `js/magie.js`

### Phase 4: Extraire le Nokorah
1. Créer `character_nokorah`
2. Migration depuis localStorage actuel
3. Mettre à jour `js/nokorah.js`

### Phase 5: Nettoyer profile_data
1. Supprimer les anciens champs migrés
2. Garder uniquement les sections de fiche

---

## Estimation de l'Impact

### Fichiers à Modifier

**Option 1 (tout d'un coup):**
- `supabase-schema.sql` (nouvelles tables)
- `js/api/characters-service.js` (nouvelles fonctions CRUD)
- `js/competences.js` (requêtes Supabase)
- `inventaire.html` (requêtes Supabase)
- `js/hdv.js` (transactions inventaire)
- `js/magie.js` (pages et capacités)
- `js/nokorah.js` (Nokorah en DB)
- `js/quetes.js` (récompenses inventaire)

**Option 2 (progressif):**
- 1 fichier de migration par phase
- 1-2 fichiers JS par phase
- Tests entre chaque phase

### Risques

**Option 1:**
- Plus de changements = plus de risque de bugs
- Difficile de revenir en arrière
- Temps de développement: 1-2 jours complets

**Option 2:**
- Migration plus longue (1 semaine)
- Mais plus sûr, testable par phase
- Rollback facile si problème

---

## Recommandation

### Je recommande Option 2 (Migration Progressive)

**Raisons:**
1. Site en production avec des utilisateurs
2. Données importantes à ne pas perdre
3. Possibilité de tester chaque phase
4. Rollback facile
5. Tu peux continuer à utiliser le site pendant la migration

**Ordre de priorité:**
1. **Compétences** en premier (structure la plus complexe, le plus à gagner)
2. **Inventaire** en second (améliore HDV et quêtes)
3. **Magie** en troisième (grosse fonctionnalité mais moins critique)
4. **Nokorah** en dernier (peu utilisé pour l'instant)

---

## Prochaines Étapes

Si tu es d'accord avec cette approche:

1. Je crée la migration pour `character_competences`
2. Je teste la migration sur quelques personnages
3. Je mets à jour `js/competences.js`
4. On teste ensemble
5. On passe à l'inventaire

**Question:** Tu veux qu'on commence par Option 1 (tout d'un coup) ou Option 2 (progressif) ?
