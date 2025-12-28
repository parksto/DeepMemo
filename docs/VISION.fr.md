# 🔮 DeepMemo - Vision Long-Terme

> **Les concepts avancés qui feront de DeepMemo un véritable "OS pour données personnelles"**

**[🇬🇧 English version available](./VISION.md)**

---

## 🎯 Philosophie centrale

DeepMemo commence simple (un seul type : le Nœud) mais **les données peuvent définir leur propre comportement**.

Au lieu de types en dur dans le code, **les types eux-mêmes sont des nœuds** qui décrivent :
- Leur schéma de données
- Leurs comportements (scripts)
- Leurs vues personnalisées
- Leurs dépendances

**C'est de la POO appliquée aux données personnelles.**

---

## 🧬 Nœuds descripteurs (Types actifs)

### Concept de base

Au lieu de :
```javascript
{
  type: "budget",  // ← Type en dur dans le code
  title: "Budget Décembre"
}
```

On aura :
```javascript
{
  implements: ["node_type_budget"],  // ← Référence à un nœud descripteur
  title: "Budget Décembre"
}
```

### Exemple complet : Type "Budget"

**Le nœud descripteur** (définit le type) :
```javascript
{
  id: "node_type_budget",
  title: "🎨 Type: Budget",
  isTypeDescriptor: true,
  
  // === SCHÉMA DE DONNÉES ===
  schema: {
    revenus: { 
      type: "number", 
      required: true,
      label: "Revenus du mois"
    },
    depenses: { 
      type: "number", 
      required: true,
      label: "Dépenses totales"
    },
    categorie: { 
      type: "string",
      enum: ["personnel", "professionnel", "famille"]
    },
    solde: {
      type: "number",
      computed: true  // Calculé automatiquement
    }
  },
  
  // === COMPORTEMENTS ACTIFS ===
  scripts: {
    // Appelé à chaque sauvegarde
    onSave: `
      // Calcul automatique du solde
      this.solde = this.revenus - this.depenses;
      
      // Ajout auto de tags selon conditions
      if (this.solde < 0) {
        this.addTag('alerte');
        this.addTag('deficit');
      } else {
        this.removeTag('alerte');
        this.removeTag('deficit');
      }
      
      // Notification si seuil dépassé
      if (this.depenses > this.revenus * 0.9) {
        app.notify('⚠️ Attention : budget presque épuisé');
      }
    `,
    
    // Interface personnalisée
    onRender: `
      const soldeClass = this.solde >= 0 ? 'positive' : 'negative';
      const percent = (this.depenses / this.revenus * 100).toFixed(1);
      
      return \`
        <div class="budget-widget">
          <div class="budget-header">
            <h3>\${this.title}</h3>
            <span class="categorie">\${this.categorie}</span>
          </div>
          
          <div class="budget-bars">
            <div class="bar revenus">
              <span>Revenus</span>
              <strong>\${this.revenus}€</strong>
            </div>
            <div class="bar depenses" style="width: \${percent}%">
              <span>Dépenses</span>
              <strong>\${this.depenses}€</strong>
            </div>
          </div>
          
          <div class="budget-solde \${soldeClass}">
            Solde: <strong>\${this.solde}€</strong>
          </div>
        </div>
      \`;
    `,
    
    // Actions personnalisées
    onAction_ExportCSV: `
      const csv = [
        'Date,Revenus,Depenses,Solde',
        \`\${this.created},\${this.revenus},\${this.depenses},\${this.solde}\`
      ].join('\\n');
      
      app.downloadFile(\`budget-\${this.title}.csv\`, csv);
    `
  },
  
  // === VUES PERSONNALISÉES ===
  views: {
    card: "budget-card",      // Vue carte par défaut
    list: "budget-row",       // Vue ligne dans liste
    graph: "budget-chart",    // Vue graphique
    print: "budget-print"     // Version imprimable
  }
}
```

**Un nœud qui l'utilise** :
```javascript
{
  id: "node_budget_dec_2024",
  title: "Budget Décembre 2024",
  implements: ["node_type_budget"],  // ← Hérite du type !
  
  // Données selon le schéma
  revenus: 3000,
  depenses: 2700,
  categorie: "personnel",
  
  // Propriétés calculées automatiquement
  solde: 300,  // ← Calculé par script onSave
  
  // Tags ajoutés automatiquement
  tags: []  // "alerte" ajouté si solde < 0
}
```

---

## 🔗 Système de dépendances et héritage

### Héritage de types

```javascript
{
  id: "node_type_budget_pro",
  title: "🎨 Type: Budget Professionnel",
  implements: ["node_type_budget"],  // ← Hérite de Budget de base
  
  // Étend le schéma
  schema: {
    ...parent.schema,
    tva: { type: "number", default: 20 },
    numero_facture: { type: "string" }
  },
  
  // Override/étend les scripts
  scripts: {
    onSave: `
      // Appeler le parent d'abord
      parent.scripts.onSave.call(this);
      
      // Logique spécifique
      this.montant_ht = this.depenses / (1 + this.tva/100);
      this.montant_tva = this.depenses - this.montant_ht;
    `
  }
}
```

### Dépendances entre types

```javascript
{
  id: "node_type_recette",
  title: "🎨 Type: Recette de cuisine",
  
  implements: ["node_type_base"],  // Héritage
  
  requires: [
    "node_type_ingredient",        // Dépendance forte
    "node_lib_nutrition",          // Bibliothèque partagée
    "node_lib_unite_conversion"    // Utilitaire
  ],
  
  schema: {
    portions: { type: "number", default: 4 },
    temps_prep: { type: "number", label: "Temps (min)" },
    difficulte: { type: "string", enum: ["facile", "moyen", "difficile"] }
  },
  
  scripts: {
    onGenerateCourses: `
      // Utilise les dépendances
      const nutrition = app.require('node_lib_nutrition');
      const convert = app.require('node_lib_unite_conversion');
      
      const ingredients = this.children
        .filter(n => n.implements.includes('node_type_ingredient'));
      
      // Ajuster les quantités
      const adjusted = ingredients.map(ing => ({
        nom: ing.title,
        quantite: convert.adjust(ing.quantite, this.portions / 4),
        unite: ing.unite
      }));
      
      // Trigger la liste de courses
      app.triggerNode('node_liste_courses', {
        action: 'addMultiple',
        items: adjusted,
        source: this.id
      });
      
      return adjusted;
    `,
    
    onCalculNutrition: `
      const nutrition = app.require('node_lib_nutrition');
      
      const total = this.children
        .filter(n => n.implements.includes('node_type_ingredient'))
        .reduce((sum, ing) => nutrition.add(sum, ing.valeurs), {});
      
      return nutrition.perPortion(total, this.portions);
    `
  }
}
```

### Résolution des dépendances

```javascript
// Algorithme de résolution
resolveDependencies(nodeId) {
  const deps = new Set();
  const visiting = new Set();
  
  const visit = (id) => {
    if (deps.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected: ${id}`);
    }
    
    visiting.add(id);
    const node = this.data.nodes[id];
    
    // Visiter les implements d'abord
    if (node.implements) {
      node.implements.forEach(typeId => visit(typeId));
    }
    
    // Puis les requires
    if (node.requires) {
      node.requires.forEach(depId => visit(depId));
    }
    
    visiting.delete(id);
    deps.add(id);
  };
  
  visit(nodeId);
  return this.topologicalSort([...deps]);
}

// Ordre topologique
topologicalSort(nodeIds) {
  const sorted = [];
  const visited = new Set();
  
  const visit = (id) => {
    if (visited.has(id)) return;
    visited.add(id);
    
    const node = this.data.nodes[id];
    const deps = [
      ...(node.implements || []),
      ...(node.requires || [])
    ];
    
    deps.forEach(depId => visit(depId));
    sorted.push(id);
  };
  
  nodeIds.forEach(id => visit(id));
  return sorted;
}
```

---

## ⚡ Trigger de nœuds distants

### Concept

Un nœud peut **déclencher des actions sur d'autres nœuds**, même s'ils ne sont pas ses enfants.

**Cas d'usage** :
- Recette → Ajoute à la liste de courses
- Tâche terminée → Met à jour le projet parent
- Budget dépassé → Crée une alerte
- Contact ajouté → Synchronise avec le calendrier

### API de trigger

```javascript
// Appel d'un trigger
app.triggerNode(targetId, payload)

// Exemple
app.triggerNode('node_liste_courses_semaine', {
  action: 'addMultiple',
  items: [
    { nom: 'Pommes', qte: 4 },
    { nom: 'Sucre', qte: '100g' }
  ],
  source: 'node_recette_tarte'
});
```

### Implémentation

```javascript
triggerNode(targetId, payload) {
  const target = this.data.nodes[targetId];
  if (!target) {
    throw new Error(`Target node not found: ${targetId}`);
  }
  
  // Charger les dépendances si nécessaire
  const deps = this.resolveDependencies(targetId);
  deps.forEach(depId => this.loadNodeType(depId));
  
  // Créer le contexte d'exécution
  const context = {
    node: target,
    payload: payload,
    app: this.createSandboxedAPI(),
    console: this.createSandboxedConsole(targetId)
  };
  
  // Exécuter le handler onTrigger
  if (target.scripts?.onTrigger) {
    return this.executeScript(
      target.scripts.onTrigger, 
      context
    );
  }
  
  // Fallback: chercher un handler d'action spécifique
  const actionHandler = `onTrigger_${payload.action}`;
  if (target.scripts?.[actionHandler]) {
    return this.executeScript(
      target.scripts[actionHandler],
      context
    );
  }
  
  console.warn(`No trigger handler for node ${targetId}`);
  return null;
}
```

### Exemple complet : Recette → Liste de courses

**Type Recette** :
```javascript
{
  id: "node_type_recette",
  scripts: {
    onAction_AjouterAuxCourses: `
      // Collecter les ingrédients
      const ingredients = this.children
        .filter(n => n.implements?.includes('node_type_ingredient'))
        .map(ing => ({
          nom: ing.title,
          quantite: ing.quantite,
          unite: ing.unite,
          rayon: ing.rayon
        }));
      
      // Trouver ou créer la liste de courses
      let listeCourses = app.findNodeByTitle('Liste de courses');
      if (!listeCourses) {
        listeCourses = app.createRootNode({
          title: 'Liste de courses',
          implements: ['node_type_liste_courses']
        });
      }
      
      // Trigger l'ajout
      app.triggerNode(listeCourses.id, {
        action: 'addMultiple',
        items: ingredients,
        sourceRecette: this.id,
        sourceRecetteTitle: this.title
      });
      
      app.notify(\`✓ Ingrédients ajoutés à la liste de courses\`);
    `
  }
}
```

**Type Liste de courses** :
```javascript
{
  id: "node_type_liste_courses",
  scripts: {
    onTrigger: `
      switch (payload.action) {
        case 'addMultiple':
          this.handleAddMultiple(payload);
          break;
        case 'remove':
          this.handleRemove(payload);
          break;
        case 'clear':
          this.handleClear();
          break;
      }
    `,
    
    handleAddMultiple: `
      // Grouper par rayon
      const byRayon = {};
      payload.items.forEach(item => {
        const rayon = item.rayon || 'Divers';
        if (!byRayon[rayon]) byRayon[rayon] = [];
        byRayon[rayon].push(item);
      });
      
      // Créer/mettre à jour les rayons
      Object.entries(byRayon).forEach(([rayon, items]) => {
        let rayonNode = this.children
          .find(c => c.title === rayon);
        
        if (!rayonNode) {
          rayonNode = app.createChildNode(this.id, {
            title: rayon,
            implements: ['node_type_rayon']
          });
        }
        
        // Ajouter/fusionner les items
        items.forEach(item => {
          const existing = rayonNode.children
            .find(c => c.title === item.nom);
          
          if (existing) {
            // Fusionner les quantités
            existing.quantite = this.sumQuantites(
              existing.quantite, 
              item.quantite,
              existing.unite,
              item.unite
            );
            
            // Ajouter la source
            if (!existing.sources) existing.sources = [];
            existing.sources.push({
              recette: payload.sourceRecetteTitle,
              id: payload.sourceRecette
            });
          } else {
            // Créer nouveau
            app.createChildNode(rayonNode.id, {
              title: item.nom,
              quantite: item.quantite,
              unite: item.unite,
              implements: ['node_type_ingredient_courses'],
              sources: [{
                recette: payload.sourceRecetteTitle,
                id: payload.sourceRecette
              }]
            });
          }
        });
      });
      
      app.saveData();
      app.render();
    `
  }
}
```

---

## 🎨 Vues multiples

### Concept

Chaque type peut définir plusieurs **vues** pour le même nœud :
- Vue carte (défaut)
- Vue liste compacte
- Vue graphique
- Vue Kanban
- Vue calendrier
- Vue imprimable
- Vue "mode cuisson" (gros texte pour recettes)

### Définition des vues

```javascript
{
  id: "node_type_task",
  views: {
    // === VUE CARTE ===
    card: {
      template: `
        <div class="task-card \${this.priority}" 
             draggable="true"
             data-node-id="\${this.id}">
          
          <div class="task-header">
            <input type="checkbox" 
                   \${this.done ? 'checked' : ''} 
                   onchange="app.toggleTask('\${this.id}')">
            <span class="task-title \${this.done ? 'done' : ''}">
              \${this.title}
            </span>
          </div>
          
          <div class="task-meta">
            \${this.dueDate ? \`<span class="due-date">\${this.dueDate}</span>\` : ''}
            \${this.assignee ? \`<span class="assignee">\${this.assignee}</span>\` : ''}
            \${this.priority ? \`<span class="priority-badge">\${this.priority}</span>\` : ''}
          </div>
          
          <div class="task-tags">
            \${this.tags.map(t => \`<span class="tag">\${t}</span>\`).join('')}
          </div>
        </div>
      `,
      css: `
        .task-card { ... }
        .task-card.high { border-left: 3px solid var(--danger); }
        .task-card .done { text-decoration: line-through; opacity: 0.6; }
      `
    },
    
    // === VUE LISTE ===
    list: {
      template: `
        <li class="task-item" data-node-id="\${this.id}">
          <input type="checkbox" \${this.done ? 'checked' : ''}>
          <span>\${this.title}</span>
          <span class="meta">\${this.dueDate || ''}</span>
        </li>
      `
    },
    
    // === VUE KANBAN ===
    kanban: {
      template: `
        <div class="kanban-card" draggable="true">
          <h4>\${this.title}</h4>
          <div class="kanban-meta">
            <span class="assignee">\${this.assignee}</span>
            <span class="points">\${this.storyPoints}pts</span>
          </div>
          <div class="tags">
            \${this.tags.map(t => \`<span class="tag">\${t}</span>\`).join('')}
          </div>
        </div>
      `,
      column: () => this.status,  // Todo / Doing / Done
      order: () => this.priority   // Ordre dans la colonne
    },
    
    // === VUE CALENDRIER ===
    calendar: {
      template: `
        <div class="calendar-event">
          <strong>\${this.title}</strong>
          <span>\${this.dueTime}</span>
        </div>
      `,
      date: () => new Date(this.dueDate),
      duration: () => this.estimatedHours
    }
  }
}
```

### Switcher de vue

```javascript
// Dans l'UI
<div class="view-switcher">
  <button onclick="app.setView('card')">📇 Cartes</button>
  <button onclick="app.setView('list')">📋 Liste</button>
  <button onclick="app.setView('kanban')">📊 Kanban</button>
  <button onclick="app.setView('calendar')">📅 Calendrier</button>
</div>

// Dans le code
setView(viewMode) {
  this.currentView = viewMode;
  this.render();
}

renderNode(nodeId, viewMode = this.currentView) {
  const node = this.data.nodes[nodeId];
  
  // Résoudre le type
  const typeNode = this.getNodeType(node);
  
  // Utiliser la vue du type
  if (typeNode?.views?.[viewMode]) {
    return this.renderView(node, typeNode.views[viewMode]);
  }
  
  // Fallback : vue par défaut
  return this.renderDefaultView(node);
}

renderView(node, viewDef) {
  // Créer le contexte
  const context = {
    ...node,
    app: this.createSandboxedAPI()
  };
  
  // Compiler le template
  const html = this.compileTemplate(viewDef.template, context);
  
  // Créer l'élément
  const el = document.createElement('div');
  el.innerHTML = html;
  
  // Injecter le CSS si présent
  if (viewDef.css && !this.loadedStyles.has(viewDef.css)) {
    this.injectStyle(viewDef.css);
    this.loadedStyles.add(viewDef.css);
  }
  
  return el.firstElementChild;
}
```

---

## 🛡️ Sandboxing et sécurité

### Environnement isolé

```javascript
executeScript(script, context) {
  // API limitée et sécurisée
  const sandbox = {
    // Nœud courant
    node: context.node,
    
    // API app restreinte
    app: {
      // Lecture seule
      findNodeByTitle: this.findNodeByTitle.bind(this),
      findNodeById: (id) => this.data.nodes[id],
      
      // Actions autorisées
      createChildNode: this.createChildNode.bind(this),
      triggerNode: this.triggerNode.bind(this),
      
      // Utilitaires
      notify: this.showToast.bind(this),
      downloadFile: this.downloadFile.bind(this),
      
      // Pas d'accès à : deleteNode, exportData, etc.
    },
    
    // Console limitée
    console: {
      log: (...args) => console.log(`[Script ${context.node.id}]`, ...args),
      warn: (...args) => console.warn(`[Script ${context.node.id}]`, ...args),
      error: (...args) => console.error(`[Script ${context.node.id}]`, ...args)
    },
    
    // Payload si trigger
    payload: context.payload
  };
  
  // Pas d'accès à window, document, etc.
  const fn = new Function(
    ...Object.keys(sandbox),
    `"use strict"; ${script}`
  );
  
  try {
    return fn(...Object.values(sandbox));
  } catch (error) {
    console.error(`Script execution error in ${context.node.id}:`, error);
    this.showToast(`❌ Erreur dans le script: ${error.message}`, 'error');
    return null;
  }
}
```

### Limites et quotas

```javascript
const SCRIPT_LIMITS = {
  maxExecutionTime: 5000,     // 5 secondes max
  maxMemory: 50 * 1024 * 1024, // 50 MB
  maxTriggersPerExec: 10,      // Max 10 triggers imbriqués
  maxChildrenCreate: 100       // Max 100 nœuds créés par exec
};

executeScriptWithLimits(script, context) {
  const startTime = Date.now();
  const startMemory = performance.memory?.usedJSHeapSize || 0;
  
  // Wrapper avec timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Script timeout')), 
               SCRIPT_LIMITS.maxExecutionTime);
  });
  
  const scriptPromise = Promise.resolve(
    this.executeScript(script, context)
  );
  
  return Promise.race([scriptPromise, timeoutPromise])
    .then(result => {
      // Vérifier la mémoire
      const endMemory = performance.memory?.usedJSHeapSize || 0;
      if (endMemory - startMemory > SCRIPT_LIMITS.maxMemory) {
        console.warn('Script used too much memory');
      }
      return result;
    });
}
```

---

## 📦 Registry de types et versioning

### Registry global

```javascript
const app = {
  typeRegistry: new Map(),
  
  // Enregistrer un type
  registerType(typeNode) {
    if (this.typeRegistry.has(typeNode.id)) {
      const existing = this.typeRegistry.get(typeNode.id);
      
      // Vérifier la version
      if (this.compareVersions(typeNode.version, existing.version) <= 0) {
        console.warn(`Type ${typeNode.id} already registered with newer version`);
        return;
      }
    }
    
    this.typeRegistry.set(typeNode.id, {
      node: typeNode,
      version: typeNode.version || '1.0.0',
      loaded: false,
      compiledScripts: null,
      compiledViews: null
    });
  },
  
  // Charger un type (avec ses dépendances)
  async loadNodeType(typeId) {
    const entry = this.typeRegistry.get(typeId);
    if (!entry) {
      throw new Error(`Type not found: ${typeId}`);
    }
    
    if (entry.loaded) return;
    
    // Charger les dépendances d'abord
    const deps = this.resolveDependencies(typeId);
    for (const depId of deps) {
      if (depId !== typeId) {
        await this.loadNodeType(depId);
      }
    }
    
    // Compiler les scripts
    entry.compiledScripts = this.compileScripts(entry.node.scripts);
    
    // Compiler les vues
    entry.compiledViews = this.compileViews(entry.node.views);
    
    entry.loaded = true;
    console.log(`✓ Type loaded: ${typeId} v${entry.version}`);
  }
}
```

### Versioning et migrations

```javascript
{
  id: "node_type_budget",
  version: "2.1.0",
  
  // Migrations entre versions
  migrations: {
    "1.0.0->2.0.0": `
      // Restructurer les données
      if (this.depenses && typeof this.depenses === 'object') {
        this.depensesFixes = this.depenses.fixes || [];
        this.depensesVariables = this.depenses.variables || [];
        delete this.depenses;
      }
    `,
    
    "2.0.0->2.1.0": `
      // Ajouter nouveaux champs avec valeurs par défaut
      if (!this.devise) {
        this.devise = 'EUR';
      }
    `
  },
  
  // Fonction de migration automatique
  migrate: `
    const currentVersion = this._typeVersion || '1.0.0';
    const targetVersion = '2.1.0';
    
    if (currentVersion === targetVersion) return;
    
    const path = this.getMigrationPath(currentVersion, targetVersion);
    path.forEach(migration => {
      console.log(\`Migrating: \${migration}\`);
      this.migrations[migration].call(this);
    });
    
    this._typeVersion = targetVersion;
    app.saveData();
  `
}

// Appliquer les migrations automatiquement
applyMigrations(node) {
  const typeNode = this.getNodeType(node);
  if (!typeNode?.migrations) return;
  
  const currentVersion = node._typeVersion || '1.0.0';
  const targetVersion = typeNode.version;
  
  if (currentVersion === targetVersion) return;
  
  const migrationPath = this.getMigrationPath(
    typeNode.migrations,
    currentVersion,
    targetVersion
  );
  
  migrationPath.forEach(migrationKey => {
    const migration = typeNode.migrations[migrationKey];
    this.executeScript(migration, { node });
  });
  
  node._typeVersion = targetVersion;
  this.saveData();
}
```

---

## 💡 Cas d'usage concrets

### 1. Système de recettes intelligent

```javascript
// Type Recette
{
  implements: ["node_type_base"],
  requires: ["node_lib_nutrition", "node_lib_conversion"],
  
  onAction_AjouterAuxCourses: "...",
  onAction_Multiplier: `
    const factor = prompt('Multiplier par combien ?');
    this.children.forEach(ing => {
      ing.quantite *= factor;
    });
    this.portions *= factor;
  `,
  onCalculNutrition: "..."
}

// Type Ingredient
{
  schema: {
    quantite: "number",
    unite: "string",
    rayon: "string"
  }
}

// Type Liste de courses
{
  onTrigger_addMultiple: "...",
  onAction_OptimiserParcours: `
    // Réorganiser par ordre de parcours magasin
    const ordreRayons = ['Fruits', 'Légumes', 'Boucherie', ...];
    this.children.sort((a, b) => 
      ordreRayons.indexOf(a.rayon) - ordreRayons.indexOf(b.rayon)
    );
  `
}
```

### 2. Gestion de projet agile

```javascript
// Type Projet
{
  views: { card: "...", kanban: "...", burndown: "..." },
  
  onCalculVelocity: `
    const sprints = this.children
      .filter(c => c.implements.includes('node_type_sprint'));
    
    const points = sprints.map(s => s.pointsCompleted);
    return points.reduce((a, b) => a + b, 0) / points.length;
  `
}

// Type Sprint
{
  onComplete: `
    this.status = 'completed';
    this.endDate = Date.now();
    
    // Calculer vélocité
    const tasks = this.children
      .filter(c => c.implements.includes('node_type_task'));
    
    this.pointsCompleted = tasks
      .filter(t => t.done)
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    // Notifier le projet parent
    app.triggerNode(this.parent, {
      action: 'sprintCompleted',
      sprint: this.id,
      velocity: this.pointsCompleted
    });
  `
}

// Type Task
{
  views: { card: "...", kanban: "...", list: "..." },
  
  onStatusChange: `
    if (this.status === 'done') {
      this.completedDate = Date.now();
      this.done = true;
      
      // Notifier le sprint
      app.triggerNode(this.parent, {
        action: 'taskCompleted',
        task: this.id
      });
    }
  `
}
```

### 3. CRM personnel

```javascript
// Type Contact
{
  schema: {
    email: "string",
    telephone: "string",
    entreprise: "string",
    dernier_contact: "date"
  },
  
  onAction_EnvoyerEmail: `
    window.location.href = \`mailto:\${this.email}\`;
    this.dernier_contact = Date.now();
  `,
  
  onRappel: `
    if (Date.now() - this.dernier_contact > 30 * 24 * 60 * 60 * 1000) {
      app.createChildNode('node_rappels', {
        title: \`Recontacter \${this.title}\`,
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000
      });
    }
  `
}

// Type Projet Client
{
  implements: ["node_type_projet"],
  
  schema: {
    client: "reference:node_type_contact",
    budget: "number",
    status: "enum"
  },
  
  onStatusChange: `
    if (this.status === 'completed') {
      // Créer une facture
      app.triggerNode('node_factures', {
        action: 'create',
        client: this.client,
        montant: this.budget,
        projet: this.id
      });
    }
  `
}
```

---

## 🎯 Questions ouvertes (à explorer plus tard)

### Sécurité
- Comment valider les scripts avant exécution ?
- Limite de CPU/mémoire par script ?
- Permissions par type de nœud ?
- Signature cryptographique des types partagés ?

### Performance
- Cache des types compilés
- Lazy loading des dépendances
- Web Workers pour scripts lourds ?
- Virtual DOM pour vues complexes ?

### UX
- Comment l'utilisateur crée des types ?
  - UI graphique (type builder)
  - Monaco Editor intégré pour les scripts
  - Templates de départ
- Marketplace de types partagés ?
- Versioning collaboratif (git-like) ?

### Architecture
- Persistence : LocalStorage → IndexedDB → Backend ?
- Synchronisation multi-devices
- Collaboration temps réel
- Federation (instances DeepMemo qui se parlent)

### Évolutivité
- Import/Export de types
- Compatibilité ascendante des versions
- Rollback de migrations
- Tests automatisés des types

---

## 🚀 Implémentation progressive

### Phase 1 : Fondations (V0.8) ✅
- [x] Nœuds de base (hiérarchie infinie, symlinks, tags)
- [x] Arborescence intelligente et navigation
- [x] Export/Import de branches
- [x] PWA installable et mode offline
- [x] Fichiers joints (IndexedDB)

### Phase 2 : Types actifs - Fondations (V0.9)
- [ ] Système d'implements basique
- [ ] Scripts simples (onSave, onRender)
- [ ] Sandbox JavaScript

### Phase 3 : Dépendances (V0.9-V1.0)
- [ ] Résolution de dépendances
- [ ] Registry de types
- [ ] Héritage simple
- [ ] Requires

### Phase 4 : Triggers (V1.0)
- [ ] API triggerNode
- [ ] Handlers onTrigger
- [ ] Exemples concrets (recettes → courses)

### Phase 5 : Vues multiples (V1.0-V1.1)
- [ ] Système de templates
- [ ] Switcher de vues
- [ ] Vues prédéfinies (card, list, kanban)

### Phase 6 : Avancé (V1.2+)
- [ ] Versioning et migrations
- [ ] Marketplace de types
- [ ] Permissions granulaires
- [ ] Collaboration temps réel

---

## 💭 Philosophie finale

**DeepMemo n'est pas qu'une app de notes.**

C'est une **plateforme** où :
- Les données se décrivent elles-mêmes
- Les comportements sont attachés aux données
- Les utilisateurs peuvent créer leurs propres "apps" internes
- Tout reste interconnecté et fluide

**C'est de la programmation accessible aux non-programmeurs**, via un système de nœuds descripteurs.

**C'est un second cerveau qui peut apprendre de nouveaux "réflexes"** via les scripts.

**C'est évolutif à l'infini** tout en restant simple à la base : tout est un nœud.

---

---

**Document Vision - Décembre 2025**
*Ces concepts seront implémentés progressivement, en commençant par les fondations (V0.9+).*

**État actuel** : V0.8 complète - Voir le contenu de démo dans l'application pour une introduction accessible à ces concepts (section "🔮 Directions explorées").
