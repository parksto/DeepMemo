# 📁 Reference - Version historique

> **Archive de la version V0.6 single-file de DeepMemo**

## 📄 Contenu

- `deepmemo-reference.html` (114K) - Version V0.6 complète en un seul fichier

## 🎯 Purpose

Ce dossier contient la **version de référence V0.6** de DeepMemo, conservée pour :

### Raisons de conservation

1. **Archive historique** - Point de départ du projet avant la restructuration multifile
2. **Référence de comparaison** - Comparer l'évolution du code entre V0.6 et V0.8+
3. **Backup fonctionnel** - Version stable et complète si besoin de rollback
4. **Documentation vivante** - Montre la transition single-file → multifile

## ⚠️ Avertissement

**Cette version n'est PLUS maintenue.**

- **Date de snapshot** : Décembre 2024
- **Dernière version stable** : V0.6
- **Pour utiliser DeepMemo** : Ouvrir `index.html` à la racine du projet (V0.8+)

## 📊 Différences avec V0.8

### V0.6 (ce fichier)
- ❌ Single-file (tout dans un HTML)
- ❌ Pas de système d'URL dynamiques
- ❌ Symlinks basiques (avec bugs connus)
- ❌ Pas de détection de cycles
- ✅ Fonctionnel et stable

### V0.8 (version actuelle)
- ✅ Multifile (HTML + CSS + JS séparés)
- ✅ URLs bookmarkables et mode branche isolée
- ✅ Symlinks refactorés avec type dédié
- ✅ Détection de cycles et références circulaires
- ✅ Auto-collapse intelligent de l'arborescence

## 🗑️ Suppression future

Ce fichier pourra être supprimé quand :
- V0.8+ sera complètement stable
- Plus aucun besoin de comparer avec l'ancien code
- L'historique git sera suffisant comme backup

---

**Note** : Ce fichier reste accessible dans l'historique git même après suppression.
