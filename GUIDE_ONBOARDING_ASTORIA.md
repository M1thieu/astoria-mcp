# Guide d'Onboarding - Développement Astoria avec Claude & Agents IA

## 📋 Introduction

Bienvenue sur le projet **Astoria** ! Ce guide va te permettre de travailler de manière autonome avec Claude Code et les agents IA spécialisés pour booster ta productivité.

---

## 🗂️ Structure des Agents (.claude/agents/)

Dans VSCode, va dans le dossier `.claude/agents/` - tu y trouveras déjà **2 agents spécialisés** :

### 1. **frontend-developer.md**
- **Utilité** : Design général, logiques frontend, composants React, state management
- **Quand l'utiliser** : Pour toute implémentation UI, performances frontend, architecture des composants

### 2. **ui-ux-designer.md**
- **Utilité** : Interface Utilisateur et eXperience Utilisateur
- **Quand l'utiliser** : Pour wireframes, design systems, accessibilité, UX optimization

**Ces agents sont des fichiers `.md` qui définissent le comportement et les connaissances de l'agent.**

---

## 🤖 Comment Appeler les Agents ?

### Avec **Claude** (Extension VSCode)
Claude peut **automatiquement** appeler les agents appropriés. Il détecte quel agent utiliser selon ta requête.

**Exemple :**
```
Toi : "J'ai besoin d'améliorer le responsive design de la page profil"
Claude : *Appelle automatiquement l'agent ui-ux-designer*
```

### Avec **Codex** (ou autres IA sans agents natifs)
Codex **ne peut pas** appeler les agents automatiquement. Tu dois **manuellement** lui mentionner le chemin du fichier agent.

**Exemple :**
```
Toi : "Utilise le fichier .claude/agents/frontend-developer.md pour m'aider à refactoriser ce composant"
Codex : *Lit le fichier et adapte ses réponses en conséquence*
```

---

## ✨ Créer des Agents Custom pour Astoria

Demain, on va créer des **agents .md personnalisés** dédiés à Astoria qui contiendront :
- Les règles de style du projet
- L'architecture globale (Supabase, localStorage, API structure)
- Les conventions de nommage
- Les patterns utilisés (profil.html, fiche.html, etc.)

**Cela te fera gagner ÉNORMÉMENT de temps** car l'IA comprendra immédiatement le contexte du projet.

---

## 📚 Préparation : Télécharger les Pages Astoria (Google Sites)

**Problème** : Les IA ont du mal à comprendre le contexte depuis Google Sites directement.

**Solution** : Télécharge toutes les pages importantes du projet et place-les dans un dossier `/docs/` ou `/context/`.

### Étapes :
1. **Ouvre chaque page importante de ton Google Sites Astoria**
2. **Sauvegarde-les en HTML ou PDF** :
   - Chrome : `Ctrl + P` → "Enregistrer au format PDF"
   - Ou `Ctrl + S` → "Page Web complète"
3. **Place-les dans un dossier** : `astoria/docs/astoria-pages/`

### Pages à télécharger (exemples) :
- Page principale / Règles du jeu
- Système de personnages
- Système de combat
- Économie / Kaels
- Fiches personnages
- Maisons / Académies
- etc.

---

## 🔍 Analyse du Projet par l'IA

Une fois les fichiers préparés, demande à l'IA d'analyser le tout :

### Prompt d'Analyse Globale
```
Je travaille sur le projet Astoria, un système de gestion de personnages pour un jeu de rôle.

Voici la structure du projet :
- Frontend : HTML/CSS/JS vanilla
- Backend : Supabase (PostgreSQL)
- Storage : localStorage pour session + Supabase pour persistence
- Pages principales : profil.html, fiche.html, competences.html, hdv.html, magie.html, inventaire.html, codex.html

J'ai téléchargé les pages de documentation Google Sites dans le dossier /docs/astoria-pages/.

Peux-tu :
1. Lire tous les fichiers du projet (HTML, JS, CSS)
2. Analyser la structure et l'architecture
3. Identifier les patterns récurrents
4. Me résumer comment fonctionne le système de personnages, le stockage de données, et les interactions avec Supabase
5. Identifier les points d'amélioration potentiels

Prends ton temps et sois exhaustif.
```

**L'IA va alors scanner tout le projet et comprendre le contexte complet.**

---

## 🛠️ Workflow de Développement avec les Agents

### Exemple de Session Type

#### 1. **Fonctionnalité UI/UX**
```
Toi : "J'ai besoin de retravailler le design de la page profil pour qu'elle soit plus moderne et responsive"

Claude : *Appelle automatiquement ui-ux-designer*
→ Propose wireframes, design system, accessibilité

Toi : "Maintenant implémente ce design"

Claude : *Appelle frontend-developer*
→ Code les composants, CSS responsive, interactions
```

#### 2. **Correction de Bugs**
```
Toi : "Le dropdown des personnages ne fonctionne plus après avoir ajouté le partage de profil"

Claude : *Analyse le code*
→ Identifie le problème
→ Propose un fix
→ Teste la solution
```

#### 3. **Nouvelle Feature Complète**
```
Toi : "Je veux ajouter un système de 'favoris' pour sauvegarder des objets magiques"

Claude : *Analyse l'architecture existante*
→ Propose une structure de données (localStorage + Supabase)
→ Crée les fonctions API (items-service.js)
→ Implémente l'UI (bouton favori, liste)
→ Teste le tout
```

---

## 🔗 MCP (Model Context Protocol) - Connexion Bot Discord

**Objectif** : Connecter le bot Discord d'Astoria pour synchroniser les tags des joueurs avec le site.

### Concept
- **MCP** = Moyen de connecter des sources de données externes à Claude
- On va créer un **serveur MCP light** qui :
  1. Se connecte au bot Discord
  2. Récupère les données des tags joueurs
  3. Les rend accessibles depuis le site

### Limitations Actuelles
- Les données ne se rechargent que sur **déconnexion/reconnexion**
- **Solution future** : Ajouter un `setInterval()` pour refresh automatique (ex: toutes les 5 min)

### Setup (on verra demain en détail)
1. Créer un serveur MCP dans `.claude/mcp-servers/`
2. Configurer les endpoints Discord API
3. Mapper les données tags → profils utilisateurs
4. Implémenter le refresh timer

---

## 📝 Checklist pour Commencer Demain

- [ ] **Ouvrir VSCode** et naviguer dans `.claude/agents/`
- [ ] **Lire** les fichiers `frontend-developer.md` et `ui-ux-designer.md`
- [ ] **Télécharger** toutes les pages Google Sites importantes
- [ ] **Placer** les fichiers dans `astoria/docs/astoria-pages/`
- [ ] **Lancer Claude** et utiliser le **Prompt d'Analyse Globale** (ci-dessus)
- [ ] **Attendre** que l'analyse soit terminée
- [ ] **Poser des questions** pour clarifier la structure du projet
- [ ] **Commencer** à développer avec les agents !

---

## 💡 Tips & Bonnes Pratiques

### 1. **Utilise les Agents de Manière Ciblée**
- Pose des questions **spécifiques** : "Comment améliorer la performance du dropdown ?"
- Évite les questions trop larges : "Refais tout le site"

### 2. **Commit Régulièrement**
- Après chaque feature fonctionnelle
- Message de commit clair : `feat: Add share button to character summary`

### 3. **Teste Avant de Pusher**
- Ouvre la page dans le navigateur
- Vérifie que tout fonctionne
- Teste les cas limites (caractère inexistant, déconnecté, etc.)

### 4. **Demande des Explications**
- Si tu ne comprends pas un bout de code, demande à Claude de l'expliquer
- "Explique-moi ligne par ligne ce que fait cette fonction"

### 5. **Sauvegarde ton Travail**
```bash
git add -A
git commit -m "feat: Add new feature"
git push
```

---

## 🆘 En Cas de Problème

### L'agent ne répond pas comme prévu ?
→ Mentionne explicitement le fichier agent :
```
"Utilise .claude/agents/frontend-developer.md pour m'aider avec cette tâche"
```

### L'IA ne comprend pas le contexte Astoria ?
→ Refais l'analyse globale avec le prompt fourni ci-dessus

### Un bug apparaît après un commit ?
→ Regarde l'historique git :
```bash
git log --oneline -10
git diff HEAD~1
```
→ Reviens en arrière si nécessaire :
```bash
git reset --hard <commit-hash>
```

### Besoin d'aide urgente ?
→ Contacte Mathieu ou Andy sur Discord

---

## 🚀 Ressources Utiles

- **Documentation Claude Code** : https://github.com/anthropics/claude-code
- **Supabase Docs** : https://supabase.com/docs
- **MDN Web Docs** : https://developer.mozilla.org/
- **Can I Use** (compatibilité navigateurs) : https://caniuse.com/

---

## 🎯 Objectifs pour Demain

1. ✅ Comprendre la structure des agents
2. ✅ Télécharger et organiser la documentation
3. ✅ Analyser le projet avec l'IA
4. ✅ Créer ton premier agent custom Astoria
5. ✅ Commencer à développer une feature simple

---

## 📞 Contact

- **Discord** : Mathieu / Andy
- **GitHub** : https://github.com/M1thieu/astoria-mcp

Bon développement ! 🎉
