# IndexedDB Migration - Testing Checklist

**Branch:** `feature/indexeddb-migration`
**Date:** 2026-01-03
**Version:** V0.10 (pre-release)

## 🎯 Objectif

Tester la migration du stockage localStorage → IndexedDB avec Dexie.js avant la mise en production.

## 🧪 Scénarios de Test

### Scénario 1: Nouvel Utilisateur (First Launch)

**Contexte:** Utilisateur qui démarre DeepMemo pour la première fois

**Steps:**
1. Ouvrir DeepMemo sur https://deepmemo.ydns.eu/
2. Ouvrir DevTools → Application → IndexedDB
3. Vérifier que la base `deepmemo` existe avec 3 stores:
   - `nodes`
   - `settings`
   - `attachments`
4. Vérifier dans Console les logs de chargement:
   - `[Storage] IndexedDB initialized with Dexie`
   - `[Data] Loaded X nodes from IndexedDB`
5. Vérifier que les nœuds de démo sont affichés
6. Créer un nouveau nœud → vérifier qu'il apparaît dans IndexedDB
7. Fermer et rouvrir → vérifier persistance

**Résultat attendu:** ✅ Données chargées depuis IndexedDB, pas de localStorage

---

### Scénario 2: Migration Utilisateur Existant

**Contexte:** Utilisateur existant avec données dans localStorage

**Preparation:**
1. Basculer sur branch `main` (version actuelle en prod)
2. Créer quelques nœuds de test avec tags + attachments
3. Noter le nombre de nœuds (visible dans le compteur)
4. Ouvrir DevTools → Application → Local Storage
5. Vérifier que `deepmemo_data` existe et contient les données

**Steps:**
1. Basculer sur branch `feature/indexeddb-migration`
2. Hard refresh (Ctrl+Shift+R)
3. Ouvrir Console et vérifier les logs:
   - `[Migration] 🚀 Starting migration from localStorage to IndexedDB...`
   - `[Migration] ✅ Migration completed successfully`
   - `[Data] ✅ Data migrated from localStorage to IndexedDB`
   - `[Data] Loaded X nodes from IndexedDB`
4. Vérifier que TOUS les nœuds sont présents
5. Vérifier que les tags sont préservés
6. Vérifier que les attachments sont accessibles
7. Ouvrir DevTools → Application:
   - IndexedDB → `deepmemo` → vérifier que les données sont là
   - Local Storage → vérifier que `deepmemo_migrated_to_indexeddb: true` existe
   - Local Storage → vérifier que `deepmemo_data` existe encore (backup)

**Résultat attendu:** ✅ Toutes les données migrées sans perte

---

### Scénario 3: Migration Attachments

**Contexte:** Migration de l'ancienne structure attachments vers Dexie

**Preparation:**
1. Sur branch `main`, ajouter un fichier attachment à un nœud
2. Vérifier dans DevTools → Application → IndexedDB:
   - Ancienne DB: `deepmemo-attachments` existe

**Steps:**
1. Basculer sur branch `feature/indexeddb-migration`
2. Hard refresh
3. Vérifier Console:
   - `[Migration] Found X attachments in old database`
   - `[Migration] ✅ Attachments migrated to new database structure`
4. Vérifier dans DevTools → Application → IndexedDB:
   - Nouvelle DB: `deepmemo` → store `attachments` contient les fichiers
   - Ancienne DB: `deepmemo-attachments` existe toujours (backup)
5. Télécharger l'attachment → vérifier qu'il fonctionne

**Résultat attendu:** ✅ Attachments migrés et fonctionnels

---

### Scénario 4: Import JSON Branch

**Contexte:** Test de l'import du fichier `Synthèse Complète.json`

**Steps:**
1. Aller dans DeepMemo
2. Bouton "Importer" → sélectionner `docs/Prospective/Synthèse Complète.json`
3. Confirmer l'import
4. Vérifier que les nœuds sont ajoutés:
   - Nœud racine: "🌟 Synthèse Complète"
   - 6 enfants affichés
5. Naviguer dans l'arborescence importée
6. Vérifier que le contenu Markdown s'affiche correctement
7. Vérifier dans DevTools → IndexedDB que les nœuds sont sauvegardés

**Résultat attendu:** ✅ Import réussi, structure préservée

---

### Scénario 5: Operations CRUD

**Contexte:** Vérifier que toutes les opérations fonctionnent avec IndexedDB

**Steps:**
1. **Create:** Créer un nouveau nœud → vérifier dans IndexedDB
2. **Read:** Actualiser la page → vérifier que le nœud est toujours là
3. **Update:** Modifier le titre et le contenu → vérifier sauvegarde
4. **Delete:** Supprimer le nœud → vérifier qu'il disparaît de IndexedDB
5. **Tags:** Ajouter/supprimer des tags → vérifier persistance
6. **Attachments:** Ajouter un fichier → vérifier dans store `attachments`
7. **Symlinks:** Créer un lien symbolique → vérifier structure
8. **Export ZIP:** Exporter tout → vérifier que le ZIP contient data + attachments
9. **Import ZIP:** Réimporter → vérifier intégrité

**Résultat attendu:** ✅ Toutes les opérations fonctionnelles

---

### Scénario 6: Fallback localStorage

**Contexte:** Tester le fallback si IndexedDB indisponible

**Steps:**
1. Ouvrir DevTools → Application → Storage
2. Décocher "IndexedDB" dans "Disable storage"
3. Hard refresh
4. Vérifier Console:
   - Warning: IndexedDB not available
   - Fallback to localStorage
5. Vérifier que l'app continue à fonctionner

**Résultat attendu:** ✅ Graceful fallback

---

### Scénario 7: Multi-Tab Sync

**Contexte:** Vérifier comportement multi-onglets

**Note:** ⚠️ La synchro cross-tab via localStorage ne fonctionnera plus avec IndexedDB.
Besoin d'implémenter BroadcastChannel dans une future version.

**Steps:**
1. Ouvrir DeepMemo dans 2 onglets
2. Modifier un nœud dans onglet 1
3. Vérifier dans onglet 2 → **PAS de synchro auto** (comportement attendu pour l'instant)
4. Actualiser onglet 2 → vérifier que les changements apparaissent

**Résultat attendu:** ⚠️ Pas de synchro auto (limitation connue, à implémenter plus tard)

---

### Scénario 8: Performance & Storage

**Contexte:** Vérifier les gains de performance et capacité

**Steps:**
1. Ouvrir DevTools → Console
2. Exécuter:
   ```javascript
   // Get storage stats
   const stats = await window.Storage.getStats();
   console.table(stats);
   ```
3. Vérifier la capacité utilisée vs disponible
4. Créer 100+ nœuds → vérifier que ça reste fluide
5. Ajouter plusieurs gros attachments (10MB+) → vérifier limite

**Résultat attendu:** ✅ Beaucoup plus de capacité que localStorage (500MB-1GB)

---

## 🐛 Bugs Connus à Surveiller

1. **⚠️ Multi-tab sync:** Ne fonctionne plus avec IndexedDB (besoin BroadcastChannel)
2. **⚠️ Service Worker:** Vérifier que le SW ne met pas en cache la nouvelle version
3. **⚠️ Migration double:** Si page rechargée pendant migration, vérifier pas de doublon

---

## ✅ Checklist Finale Avant Merge

- [ ] Scénario 1: Nouvel utilisateur OK
- [ ] Scénario 2: Migration utilisateur existant OK
- [ ] Scénario 3: Migration attachments OK
- [ ] Scénario 4: Import JSON branch OK
- [ ] Scénario 5: Toutes opérations CRUD OK
- [ ] Scénario 6: Fallback localStorage OK
- [ ] Scénario 7: Multi-tab comportement documenté
- [ ] Scénario 8: Performance acceptable
- [ ] Console clean (pas d'erreurs rouges)
- [ ] DevTools → Application clean
- [ ] Documentation mise à jour
- [ ] CLAUDE.md mis à jour avec changements V0.10

---

## 🚀 Commandes Git

```bash
# Si tests OK, merger dans main
git checkout main
git merge feature/indexeddb-migration

# Créer tag version
git tag v0.10.0-beta
git push origin main --tags

# Si problème, rollback
git checkout main
git reset --hard HEAD~1
```

---

## 📊 Métriques Attendues

- **Migration time:** <1 seconde pour 100 nœuds
- **Load time:** <500ms
- **Save time:** <100ms (async, non-bloquant)
- **Storage capacity:** 500MB-1GB (vs 5-10MB avant)
- **Console errors:** 0

---

## 🔄 Rollback Plan

Si problème critique en production:

1. Basculer sur branche `main` (version stable)
2. Les utilisateurs migrés ont toujours leur backup localStorage
3. Dans une future version, implémenter un bouton "Restore from localStorage backup"

---

**Happy Testing! 🎉**
