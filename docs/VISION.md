# 🔮 DeepMemo - Long-Term Vision

> **Advanced concepts that will make DeepMemo a true "OS for personal data"**

**[🇫🇷 Version française disponible](./VISION.fr.md)**

---

## 🎯 Core Philosophy

DeepMemo starts simple (a single type: the Node) but **data can define its own behavior**.

Instead of hardcoded types, **types themselves are nodes** that describe:
- Their data schema
- Their behaviors (scripts)
- Their custom views
- Their dependencies

**This is OOP applied to personal data.**

---

## 🧬 Descriptor Nodes (Active Types)

### Basic Concept

Instead of:
```javascript
{
  type: "budget",  // ← Hardcoded type
  title: "December Budget"
}
```

We'll have:
```javascript
{
  implements: ["node_type_budget"],  // ← Reference to a descriptor node
  title: "December Budget"
}
```

### Complete Example: "Budget" Type

**The descriptor node** (defines the type):
```javascript
{
  id: "node_type_budget",
  title: "🎨 Type: Budget",
  isTypeDescriptor: true,

  // === DATA SCHEMA ===
  schema: {
    income: {
      type: "number",
      required: true,
      label: "Monthly income"
    },
    expenses: {
      type: "number",
      required: true,
      label: "Total expenses"
    },
    category: {
      type: "string",
      enum: ["personal", "business", "family"]
    },
    balance: {
      type: "number",
      computed: true  // Automatically calculated
    }
  },

  // === ACTIVE BEHAVIORS ===
  scripts: {
    // Called on every save
    onSave: `
      // Automatic balance calculation
      this.balance = this.income - this.expenses;

      // Auto-add tags based on conditions
      if (this.balance < 0) {
        this.addTag('alert');
        this.addTag('deficit');
      } else {
        this.removeTag('alert');
        this.removeTag('deficit');
      }

      // Notification if threshold exceeded
      if (this.expenses > this.income * 0.9) {
        app.notify('⚠️ Warning: budget almost depleted');
      }
    `,

    // Custom interface
    onRender: `
      const balanceClass = this.balance >= 0 ? 'positive' : 'negative';
      const percent = (this.expenses / this.income * 100).toFixed(1);

      return \`
        <div class="budget-widget">
          <div class="budget-header">
            <h3>\${this.title}</h3>
            <span class="category">\${this.category}</span>
          </div>

          <div class="budget-bars">
            <div class="bar income">
              <span>Income</span>
              <strong>\${this.income}€</strong>
            </div>
            <div class="bar expenses" style="width: \${percent}%">
              <span>Expenses</span>
              <strong>\${this.expenses}€</strong>
            </div>
          </div>

          <div class="budget-balance \${balanceClass}">
            Balance: <strong>\${this.balance}€</strong>
          </div>
        </div>
      \`;
    `,

    // Custom actions
    onAction_ExportCSV: `
      const csv = [
        'Date,Income,Expenses,Balance',
        \`\${this.created},\${this.income},\${this.expenses},\${this.balance}\`
      ].join('\\n');

      app.downloadFile(\`budget-\${this.title}.csv\`, csv);
    `
  },

  // === CUSTOM VIEWS ===
  views: {
    card: "budget-card",      // Default card view
    list: "budget-row",       // List row view
    graph: "budget-chart",    // Graph view
    print: "budget-print"     // Printable version
  }
}
```

**A node using it**:
```javascript
{
  id: "node_budget_dec_2024",
  title: "December 2024 Budget",
  implements: ["node_type_budget"],  // ← Inherits from the type!

  // Data according to the schema
  income: 3000,
  expenses: 2700,
  category: "personal",

  // Automatically calculated properties
  balance: 300,  // ← Calculated by onSave script

  // Automatically added tags
  tags: []  // "alert" added if balance < 0
}
```

---

## 🔗 Dependency System and Inheritance

### Type Inheritance

```javascript
{
  id: "node_type_budget_business",
  title: "🎨 Type: Business Budget",
  implements: ["node_type_budget"],  // ← Inherits from base Budget

  // Extends the schema
  schema: {
    ...parent.schema,
    vat: { type: "number", default: 20 },
    invoice_number: { type: "string" }
  },

  // Override/extend scripts
  scripts: {
    onSave: `
      // Call parent first
      parent.scripts.onSave.call(this);

      // Specific logic
      this.amount_excl_vat = this.expenses / (1 + this.vat/100);
      this.vat_amount = this.expenses - this.amount_excl_vat;
    `
  }
}
```

### Dependencies Between Types

```javascript
{
  id: "node_type_recipe",
  title: "🎨 Type: Cooking Recipe",

  implements: ["node_type_base"],  // Inheritance

  requires: [
    "node_type_ingredient",        // Strong dependency
    "node_lib_nutrition",          // Shared library
    "node_lib_unit_conversion"     // Utility
  ],

  schema: {
    servings: { type: "number", default: 4 },
    prep_time: { type: "number", label: "Time (min)" },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
  },

  scripts: {
    onGenerateShoppingList: `
      // Use dependencies
      const nutrition = app.require('node_lib_nutrition');
      const convert = app.require('node_lib_unit_conversion');

      const ingredients = this.children
        .filter(n => n.implements.includes('node_type_ingredient'));

      // Adjust quantities
      const adjusted = ingredients.map(ing => ({
        name: ing.title,
        quantity: convert.adjust(ing.quantity, this.servings / 4),
        unit: ing.unit
      }));

      // Trigger the shopping list
      app.triggerNode('node_shopping_list', {
        action: 'addMultiple',
        items: adjusted,
        source: this.id
      });

      return adjusted;
    `,

    onCalculateNutrition: `
      const nutrition = app.require('node_lib_nutrition');

      const total = this.children
        .filter(n => n.implements.includes('node_type_ingredient'))
        .reduce((sum, ing) => nutrition.add(sum, ing.values), {});

      return nutrition.perServing(total, this.servings);
    `
  }
}
```

### Dependency Resolution

```javascript
// Resolution algorithm
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

    // Visit implements first
    if (node.implements) {
      node.implements.forEach(typeId => visit(typeId));
    }

    // Then requires
    if (node.requires) {
      node.requires.forEach(depId => visit(depId));
    }

    visiting.delete(id);
    deps.add(id);
  };

  visit(nodeId);
  return this.topologicalSort([...deps]);
}

// Topological sort
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

## ⚡ Remote Node Triggering

### Concept

A node can **trigger actions on other nodes**, even if they're not its children.

**Use cases**:
- Recipe → Add to shopping list
- Task completed → Update parent project
- Budget exceeded → Create an alert
- Contact added → Sync with calendar

### Trigger API

```javascript
// Trigger call
app.triggerNode(targetId, payload)

// Example
app.triggerNode('node_shopping_list_week', {
  action: 'addMultiple',
  items: [
    { name: 'Apples', qty: 4 },
    { name: 'Sugar', qty: '100g' }
  ],
  source: 'node_recipe_pie'
});
```

### Implementation

```javascript
triggerNode(targetId, payload) {
  const target = this.data.nodes[targetId];
  if (!target) {
    throw new Error(`Target node not found: ${targetId}`);
  }

  // Load dependencies if necessary
  const deps = this.resolveDependencies(targetId);
  deps.forEach(depId => this.loadNodeType(depId));

  // Create execution context
  const context = {
    node: target,
    payload: payload,
    app: this.createSandboxedAPI(),
    console: this.createSandboxedConsole(targetId)
  };

  // Execute the onTrigger handler
  if (target.scripts?.onTrigger) {
    return this.executeScript(
      target.scripts.onTrigger,
      context
    );
  }

  // Fallback: look for specific action handler
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

### Complete Example: Recipe → Shopping List

**Recipe Type**:
```javascript
{
  id: "node_type_recipe",
  scripts: {
    onAction_AddToShopping: `
      // Collect ingredients
      const ingredients = this.children
        .filter(n => n.implements?.includes('node_type_ingredient'))
        .map(ing => ({
          name: ing.title,
          quantity: ing.quantity,
          unit: ing.unit,
          aisle: ing.aisle
        }));

      // Find or create shopping list
      let shoppingList = app.findNodeByTitle('Shopping List');
      if (!shoppingList) {
        shoppingList = app.createRootNode({
          title: 'Shopping List',
          implements: ['node_type_shopping_list']
        });
      }

      // Trigger the addition
      app.triggerNode(shoppingList.id, {
        action: 'addMultiple',
        items: ingredients,
        sourceRecipe: this.id,
        sourceRecipeTitle: this.title
      });

      app.notify(\`✓ Ingredients added to shopping list\`);
    `
  }
}
```

**Shopping List Type**:
```javascript
{
  id: "node_type_shopping_list",
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
      // Group by aisle
      const byAisle = {};
      payload.items.forEach(item => {
        const aisle = item.aisle || 'Miscellaneous';
        if (!byAisle[aisle]) byAisle[aisle] = [];
        byAisle[aisle].push(item);
      });

      // Create/update aisles
      Object.entries(byAisle).forEach(([aisle, items]) => {
        let aisleNode = this.children
          .find(c => c.title === aisle);

        if (!aisleNode) {
          aisleNode = app.createChildNode(this.id, {
            title: aisle,
            implements: ['node_type_aisle']
          });
        }

        // Add/merge items
        items.forEach(item => {
          const existing = aisleNode.children
            .find(c => c.title === item.name);

          if (existing) {
            // Merge quantities
            existing.quantity = this.sumQuantities(
              existing.quantity,
              item.quantity,
              existing.unit,
              item.unit
            );

            // Add source
            if (!existing.sources) existing.sources = [];
            existing.sources.push({
              recipe: payload.sourceRecipeTitle,
              id: payload.sourceRecipe
            });
          } else {
            // Create new
            app.createChildNode(aisleNode.id, {
              title: item.name,
              quantity: item.quantity,
              unit: item.unit,
              implements: ['node_type_shopping_ingredient'],
              sources: [{
                recipe: payload.sourceRecipeTitle,
                id: payload.sourceRecipe
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

## 🎨 Multiple Views

### Concept

Each type can define multiple **views** for the same node:
- Card view (default)
- Compact list view
- Graph view
- Kanban view
- Calendar view
- Printable view
- "Cooking mode" view (large text for recipes)

### View Definitions

```javascript
{
  id: "node_type_task",
  views: {
    // === CARD VIEW ===
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

    // === LIST VIEW ===
    list: {
      template: `
        <li class="task-item" data-node-id="\${this.id}">
          <input type="checkbox" \${this.done ? 'checked' : ''}>
          <span>\${this.title}</span>
          <span class="meta">\${this.dueDate || ''}</span>
        </li>
      `
    },

    // === KANBAN VIEW ===
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
      order: () => this.priority   // Order in column
    },

    // === CALENDAR VIEW ===
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

### View Switcher

```javascript
// In the UI
<div class="view-switcher">
  <button onclick="app.setView('card')">📇 Cards</button>
  <button onclick="app.setView('list')">📋 List</button>
  <button onclick="app.setView('kanban')">📊 Kanban</button>
  <button onclick="app.setView('calendar')">📅 Calendar</button>
</div>

// In the code
setView(viewMode) {
  this.currentView = viewMode;
  this.render();
}

renderNode(nodeId, viewMode = this.currentView) {
  const node = this.data.nodes[nodeId];

  // Resolve the type
  const typeNode = this.getNodeType(node);

  // Use the type's view
  if (typeNode?.views?.[viewMode]) {
    return this.renderView(node, typeNode.views[viewMode]);
  }

  // Fallback: default view
  return this.renderDefaultView(node);
}

renderView(node, viewDef) {
  // Create context
  const context = {
    ...node,
    app: this.createSandboxedAPI()
  };

  // Compile template
  const html = this.compileTemplate(viewDef.template, context);

  // Create element
  const el = document.createElement('div');
  el.innerHTML = html;

  // Inject CSS if present
  if (viewDef.css && !this.loadedStyles.has(viewDef.css)) {
    this.injectStyle(viewDef.css);
    this.loadedStyles.add(viewDef.css);
  }

  return el.firstElementChild;
}
```

---

## 🛡️ Sandboxing and Security

### Isolated Environment

```javascript
executeScript(script, context) {
  // Limited and secured API
  const sandbox = {
    // Current node
    node: context.node,

    // Restricted app API
    app: {
      // Read-only
      findNodeByTitle: this.findNodeByTitle.bind(this),
      findNodeById: (id) => this.data.nodes[id],

      // Allowed actions
      createChildNode: this.createChildNode.bind(this),
      triggerNode: this.triggerNode.bind(this),

      // Utilities
      notify: this.showToast.bind(this),
      downloadFile: this.downloadFile.bind(this),

      // No access to: deleteNode, exportData, etc.
    },

    // Limited console
    console: {
      log: (...args) => console.log(`[Script ${context.node.id}]`, ...args),
      warn: (...args) => console.warn(`[Script ${context.node.id}]`, ...args),
      error: (...args) => console.error(`[Script ${context.node.id}]`, ...args)
    },

    // Payload if trigger
    payload: context.payload
  };

  // No access to window, document, etc.
  const fn = new Function(
    ...Object.keys(sandbox),
    `"use strict"; ${script}`
  );

  try {
    return fn(...Object.values(sandbox));
  } catch (error) {
    console.error(`Script execution error in ${context.node.id}:`, error);
    this.showToast(`❌ Script error: ${error.message}`, 'error');
    return null;
  }
}
```

### Limits and Quotas

```javascript
const SCRIPT_LIMITS = {
  maxExecutionTime: 5000,     // 5 seconds max
  maxMemory: 50 * 1024 * 1024, // 50 MB
  maxTriggersPerExec: 10,      // Max 10 nested triggers
  maxChildrenCreate: 100       // Max 100 nodes created per exec
};

executeScriptWithLimits(script, context) {
  const startTime = Date.now();
  const startMemory = performance.memory?.usedJSHeapSize || 0;

  // Wrapper with timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Script timeout')),
               SCRIPT_LIMITS.maxExecutionTime);
  });

  const scriptPromise = Promise.resolve(
    this.executeScript(script, context)
  );

  return Promise.race([scriptPromise, timeoutPromise])
    .then(result => {
      // Check memory
      const endMemory = performance.memory?.usedJSHeapSize || 0;
      if (endMemory - startMemory > SCRIPT_LIMITS.maxMemory) {
        console.warn('Script used too much memory');
      }
      return result;
    });
}
```

---

## 📦 Type Registry and Versioning

### Global Registry

```javascript
const app = {
  typeRegistry: new Map(),

  // Register a type
  registerType(typeNode) {
    if (this.typeRegistry.has(typeNode.id)) {
      const existing = this.typeRegistry.get(typeNode.id);

      // Check version
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

  // Load a type (with its dependencies)
  async loadNodeType(typeId) {
    const entry = this.typeRegistry.get(typeId);
    if (!entry) {
      throw new Error(`Type not found: ${typeId}`);
    }

    if (entry.loaded) return;

    // Load dependencies first
    const deps = this.resolveDependencies(typeId);
    for (const depId of deps) {
      if (depId !== typeId) {
        await this.loadNodeType(depId);
      }
    }

    // Compile scripts
    entry.compiledScripts = this.compileScripts(entry.node.scripts);

    // Compile views
    entry.compiledViews = this.compileViews(entry.node.views);

    entry.loaded = true;
    console.log(`✓ Type loaded: ${typeId} v${entry.version}`);
  }
}
```

### Versioning and Migrations

```javascript
{
  id: "node_type_budget",
  version: "2.1.0",

  // Migrations between versions
  migrations: {
    "1.0.0->2.0.0": `
      // Restructure data
      if (this.expenses && typeof this.expenses === 'object') {
        this.fixedExpenses = this.expenses.fixed || [];
        this.variableExpenses = this.expenses.variable || [];
        delete this.expenses;
      }
    `,

    "2.0.0->2.1.0": `
      // Add new fields with default values
      if (!this.currency) {
        this.currency = 'EUR';
      }
    `
  },

  // Automatic migration function
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

// Apply migrations automatically
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

## 💡 Concrete Use Cases

### 1. Smart Recipe System

```javascript
// Recipe Type
{
  implements: ["node_type_base"],
  requires: ["node_lib_nutrition", "node_lib_conversion"],

  onAction_AddToShopping: "...",
  onAction_Multiply: `
    const factor = prompt('Multiply by how much?');
    this.children.forEach(ing => {
      ing.quantity *= factor;
    });
    this.servings *= factor;
  `,
  onCalculateNutrition: "..."
}

// Ingredient Type
{
  schema: {
    quantity: "number",
    unit: "string",
    aisle: "string"
  }
}

// Shopping List Type
{
  onTrigger_addMultiple: "...",
  onAction_OptimizeRoute: `
    // Reorganize by store layout order
    const aisleOrder = ['Produce', 'Vegetables', 'Meat', ...];
    this.children.sort((a, b) =>
      aisleOrder.indexOf(a.aisle) - aisleOrder.indexOf(b.aisle)
    );
  `
}
```

### 2. Agile Project Management

```javascript
// Project Type
{
  views: { card: "...", kanban: "...", burndown: "..." },

  onCalculateVelocity: `
    const sprints = this.children
      .filter(c => c.implements.includes('node_type_sprint'));

    const points = sprints.map(s => s.pointsCompleted);
    return points.reduce((a, b) => a + b, 0) / points.length;
  `
}

// Sprint Type
{
  onComplete: `
    this.status = 'completed';
    this.endDate = Date.now();

    // Calculate velocity
    const tasks = this.children
      .filter(c => c.implements.includes('node_type_task'));

    this.pointsCompleted = tasks
      .filter(t => t.done)
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Notify parent project
    app.triggerNode(this.parent, {
      action: 'sprintCompleted',
      sprint: this.id,
      velocity: this.pointsCompleted
    });
  `
}

// Task Type
{
  views: { card: "...", kanban: "...", list: "..." },

  onStatusChange: `
    if (this.status === 'done') {
      this.completedDate = Date.now();
      this.done = true;

      // Notify sprint
      app.triggerNode(this.parent, {
        action: 'taskCompleted',
        task: this.id
      });
    }
  `
}
```

### 3. Personal CRM

```javascript
// Contact Type
{
  schema: {
    email: "string",
    phone: "string",
    company: "string",
    last_contact: "date"
  },

  onAction_SendEmail: `
    window.location.href = \`mailto:\${this.email}\`;
    this.last_contact = Date.now();
  `,

  onReminder: `
    if (Date.now() - this.last_contact > 30 * 24 * 60 * 60 * 1000) {
      app.createChildNode('node_reminders', {
        title: \`Follow up with \${this.title}\`,
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000
      });
    }
  `
}

// Client Project Type
{
  implements: ["node_type_project"],

  schema: {
    client: "reference:node_type_contact",
    budget: "number",
    status: "enum"
  },

  onStatusChange: `
    if (this.status === 'completed') {
      // Create an invoice
      app.triggerNode('node_invoices', {
        action: 'create',
        client: this.client,
        amount: this.budget,
        project: this.id
      });
    }
  `
}
```

---

## 🎯 Open Questions (to explore later)

### Security
- How to validate scripts before execution?
- CPU/memory limits per script?
- Permissions per node type?
- Cryptographic signature for shared types?

### Performance
- Cache for compiled types
- Lazy loading of dependencies
- Web Workers for heavy scripts?
- Virtual DOM for complex views?

### UX
- How do users create types?
  - Graphical UI (type builder)
  - Integrated Monaco Editor for scripts
  - Starter templates
- Marketplace for shared types?
- Collaborative versioning (git-like)?

### Architecture
- Persistence: LocalStorage → IndexedDB → Backend?
- Multi-device synchronization
- Real-time collaboration
- Federation (DeepMemo instances talking to each other)

### Scalability
- Import/Export of types
- Backward compatibility of versions
- Migration rollback
- Automated type testing

---

## 🚀 Progressive Implementation

### Phase 1: Foundations (V0.8) ✅
- [x] Base nodes (infinite hierarchy, symlinks, tags)
- [x] Smart tree and navigation
- [x] Branch export/import
- [x] Installable PWA and offline mode
- [x] File attachments (IndexedDB)

### Phase 2: Active Types - Foundations (V0.9)
- [ ] Basic implements system
- [ ] Simple scripts (onSave, onRender)
- [ ] JavaScript sandbox

### Phase 3: Dependencies (V0.9-V1.0)
- [ ] Dependency resolution
- [ ] Type registry
- [ ] Simple inheritance
- [ ] Requires

### Phase 4: Triggers (V1.0)
- [ ] triggerNode API
- [ ] onTrigger handlers
- [ ] Concrete examples (recipes → shopping)

### Phase 5: Multiple Views (V1.0-V1.1)
- [ ] Template system
- [ ] View switcher
- [ ] Predefined views (card, list, kanban)

### Phase 6: Advanced (V1.2+)
- [ ] Versioning and migrations
- [ ] Type marketplace
- [ ] Granular permissions
- [ ] Real-time collaboration

---

## 💭 Final Philosophy

**DeepMemo is not just a note-taking app.**

It's a **platform** where:
- Data describes itself
- Behaviors are attached to data
- Users can create their own internal "apps"
- Everything stays interconnected and fluid

**It's programming made accessible to non-programmers**, through a system of descriptor nodes.

**It's a second brain that can learn new "reflexes"** through scripts.

**It's infinitely scalable** while remaining simple at its core: everything is a node.

---

---

**Vision Document - December 2025**
*These concepts will be implemented progressively, starting with the foundations (V0.9+).*

**Current state**: V0.8 complete - See the demo content in the application for an accessible introduction to these concepts (section "🔮 Future Directions").
