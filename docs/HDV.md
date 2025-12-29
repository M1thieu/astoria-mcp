# Hôtel de vente (HDV)

## Prérequis

- Un projet Supabase configuré dans `js/auth.js` (`SUPABASE_URL` + `SUPABASE_ANON_KEY`).
- Exécuter le schéma `supabase-schema.sql` dans l’éditeur SQL Supabase (il contient les tables HDV + la RPC `buy_listing`).

## Ouvrir la page

- Ouvrir `hdv.html` (idéalement via un serveur local type Live Server).
- Se connecter via `login.html` (ex: `player1` / `player123` si vous avez chargé les données d’exemple).

## Flux de test rapide

1. Aller dans `hdv.html` → onglet **Mes offres**.
2. Créer une offre : choisir un objet, quantité, prix/unité (pré-rempli avec le “flat” issu de `data.js` quand disponible).
3. Onglet **Rechercher** : retrouver l’offre, tester le tri “les moins chers” + pagination.
4. Cliquer **Acheter** : la RPC `buy_listing` debite/credite les kaels, marque l'offre `sold`, et met a jour `market` (buyer_id, buyer_character_id, sold_at).
5. Onglet **Historique** : verifier l'entree Achat/Vente.

## Kaels

- Les kaels sont stockes dans `characters.kaels` (par personnage) et affiches comme "kaels" cote UI.
- Pour ajuster manuellement :

```sql
update characters set kaels = 50000 where id = '<uuid_character>';
```

## Notes sécurité

Ce repo utilise un login custom (`users` + localStorage) et ne s’appuie pas sur Supabase Auth. Les policies RLS sont donc permissives pour que l’app fonctionne avec la clé anon.
