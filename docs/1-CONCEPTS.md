# Core Concepts

**Understanding DeepMemo's fundamental building blocks**

This document explains the core concepts that make DeepMemo work. Start here if you're new to the project or need to understand how the pieces fit together.

---

## 1. The Node: A Single Base Type

DeepMemo has **one fundamental unit**: the **node**.

A node is a container that can hold:
- **Title**: Short description (e.g., "Project ideas", "Meeting notes")
- **Content**: Markdown text (unlimited length)
- **Children**: Other nodes (creating hierarchy)
- **Tags**: Labels for categorization
- **Attachments**: Files (images, PDFs, documents)
- **Metadata**: Creation date, modification date, etc.

```
┌─────────────────────────────┐
│  📄 Node                    │
│  ─────                      │
│  Title: "My project"        │
│  Content: "Some notes..."   │
│  Children: [node1, node2]   │
│  Tags: ["work", "urgent"]   │
│  Attachments: [file.pdf]    │
└─────────────────────────────┘
```

**Key insight**: Everything is a node. There are no "folders", "documents", or "categories" as separate types. This simplicity enables powerful features like symlinks and flexible organization.

---

## 2. Hierarchy: Parent-Child Relationships

Nodes organize themselves through **parent-child relationships**, forming a tree structure.

### Basic Tree Structure

```
Root Nodes (top level)
├─ 📘 Work
│  ├─ 📋 Project A
│  │  ├─ 📝 Task 1
│  │  └─ 📝 Task 2
│  └─ 📋 Project B
└─ 🏠 Personal
   ├─ 📚 Books
   └─ ✈️ Travel
```

### Properties

- **Multiple roots**: You can have several top-level nodes (not forced into a single root)
- **Unlimited depth**: Nodes can nest infinitely (node → child → grandchild → ...)
- **Single parent**: Each node has exactly one parent (except root nodes, which have `parent: null`)
- **Ordered children**: Children maintain their order (can be rearranged via drag & drop)

### Navigation

Users navigate the tree by:
- **Expanding/collapsing** nodes (show/hide children)
- **Selecting** a node (displays its content in the central panel)
- **Breadcrumb** trail showing the path from root to current node

**Why hierarchy?** Human knowledge naturally organizes hierarchically. Projects have tasks, books have chapters, trips have destinations. DeepMemo mirrors this natural structure.

---

## 3. Symlinks: From Tree to Network

A pure hierarchy has a limitation: a node can only exist in one place. But real-world information often belongs in multiple contexts.

**Symlinks** (symbolic links) solve this by allowing a node to appear in multiple locations.

### How Symlinks Work

```
Work
├─ 📋 Project A
│  ├─ 📝 Task: Review design
│  └─ 📝 Task: Test feature
└─ 🔁 Team Meetings
   ├─ 📅 2026-01-27 Meeting
   └─ 🔗 Task: Review design  ← Symlink to node in Project A

Personal
└─ 📚 Learning
   └─ 🔗 Task: Review design  ← Same symlink, different context
```

The "Review design" task physically exists under "Project A", but appears (via symlinks) in:
- Team Meetings (discussed in a meeting)
- Learning (something I learned from this task)

### Symlink Properties

**Renameable**: You can give the symlink a different title than the original node.
```
Original: "Technical specification document v2.3"
Symlink in "Quick Reference": "Spec doc"
Symlink in "Archive 2025": "Old spec (2025)"
```

**Content follows target**: The actual content (markdown, attachments, children) always comes from the target node. Editing a symlink edits the original.

**Independent deletion**: Deleting a symlink doesn't delete the target node. It just removes that reference.

### Reticular Structure

With symlinks, the hierarchy becomes a **reticular structure** (network-like tree):

```
        Tree              +        Symlinks         =        Network

    A                                                      A
   / \                                                    / \
  B   C                                                  B═══C
                              C → B                       ║
                          (symlink)
                                                    (B appears under both A and C)
```

**Why symlinks?** Knowledge isn't purely hierarchical. A research paper can be relevant to multiple projects. A contact can belong to work and personal contexts. Symlinks let information exist where it's needed without duplication.

---

## 4. Instance Keys: Tracking Paths

Here's a problem symlinks create: How do you uniquely identify a node when it appears multiple times in the tree?

### The Problem

```
Root
├─ Project A
│  └─ Task X (id: "node_123")
└─ Archive
   └─ 🔗 Task X (also id: "node_123" - it's the same node!)
```

Both instances have `id: "node_123"`, but they're in different places. How do we distinguish them?

### The Solution: Instance Keys

An **instance key** encodes the full path from the root to the node:

```
nodeId @ parent @ grandparent @ ... @ root
```

**Examples**:
- Root node: `"node_123@root"`
- Child: `"node_456@node_123@root"`
- Grandchild: `"node_789@node_456@node_123@root"`
- Via symlink: `"node_123@node_999@root"` (same node, different path)

### Why This Matters

Instance keys enable:
1. **Unique selection**: Know exactly which instance the user clicked
2. **Cycle detection**: Prevent infinite loops (node containing itself via symlinks)
3. **Context preservation**: Remember where you were in the tree across page refreshes
4. **Branch isolation**: (see next section)

**Implementation detail**: The function `getInstanceKey(nodeId, parentContext)` in `tree.js` generates these keys during tree rendering.

---

## 5. Branch Mode: Isolated Subtrees

Sometimes you want to focus on just one part of your knowledge tree, ignoring everything else.

**Branch Mode** lets you isolate a subtree, displaying only a specific node and its descendants.

### Normal Mode vs Branch Mode

**Normal Mode** (default):
```
Root Nodes (all visible)
├─ 📘 Work
│  ├─ Project A
│  └─ Project B
├─ 🏠 Personal
└─ 📚 Archive
```

**Branch Mode** (isolate "Work"):
```
Work (branch root)
├─ Project A
│  ├─ Task 1
│  └─ Task 2
└─ Project B
   └─ Task 3

(Personal and Archive are hidden)
```

### How It Works

1. **URL parameter**: `?branch=node_123` sets the branch root
2. **Tree rendering**: Only renders descendants of `node_123`
3. **Instance keys**: Stop at the branch root (e.g., `"node_456@node_123"` instead of continuing to global root)
4. **Navigation**: Breadcrumb starts at branch root
5. **Search**: Limited to nodes within the branch

### External Symlinks

What if a symlink points outside the branch?

```
Branch: Work
├─ Project A
└─ 🔗 Important Note  ← Points to a node in Personal (outside branch)
```

**Behavior**: External symlinks are **grayed out** in branch mode:
- Grayed out appearance (opacity 0.4)
- Badge "externe" / "external" (depending on language)
- Icon: 🔗🚫
- Clickable but shows warning toast (selection allowed for deletion purposes)
- Not draggable

**Why disabled for navigation?** Following an external symlink would break the branch isolation. The target node wouldn't be accessible in the current view. However, selection is allowed so you can delete external symlinks if needed.

### Use Cases

- **Sharing**: Export a specific project without your entire knowledge base
- **Focus**: Work on one area without distractions
- **Presentations**: Show a specific subtree during meetings
- **Collaboration**: Share a branch via `.dm` export without exposing unrelated content

**URL format**: Branch mode uses query parameters + hash:
```
?branch=node_123#/node/node_456
       ├─────────┘      └──────────┘
   branch root ID    currently viewed node
```

This design allows:
- **Bookmarking** branches (query param persists)
- **Browser navigation** (hash enables back/forward buttons)

---

## 6. Tags: Cross-Cutting Metadata

While hierarchy organizes nodes vertically (parent → child), **tags** organize them horizontally across the tree.

### Basic Usage

Any node can have multiple tags:
```
Node: "React component architecture"
Tags: ["react", "frontend", "tutorial", "video"]
```

Tags enable:
- **Search by tag**: Find all nodes with "frontend" tag
- **Tag cloud**: See all tags in current branch
- **Autocomplete**: Suggests existing tags while typing
- **Filtering**: (future feature)

### Tag Scope

Tags are **global** but search respects branch mode:
- **Normal mode**: Search finds tagged nodes anywhere in the tree
- **Branch mode**: Search finds tagged nodes only within the current branch

### Tags vs Hierarchy

**When to use hierarchy**:
- Clear parent-child relationship (Project → Tasks)
- Sequential or nested structure (Book → Chapters → Sections)
- One primary categorization

**When to use tags**:
- Multiple categorizations (a note can be both "tutorial" and "advanced")
- Cross-project themes (all nodes related to "security")
- Status markers ("todo", "review", "done")
- Temporal markers ("2025", "Q1")

**Best practice**: Use both. Hierarchy for structure, tags for flexible cross-referencing.

```
Work (hierarchy)
├─ Project A [tags: security, backend]
│  └─ Task 1 [tags: security, urgent]
└─ Project B [tags: frontend]
   └─ Task 2 [tags: security]

Search for "security" → finds Project A, Task 1, Task 2
```

---

## Putting It All Together

DeepMemo's power comes from combining these concepts:

1. **Nodes** provide a single, flexible unit
2. **Hierarchy** creates natural organization
3. **Symlinks** connect related information across contexts
4. **Instance keys** track unique paths through the network
5. **Branch mode** enables focused views and safe sharing
6. **Tags** add orthogonal categorization

**Example workflow**:

```
1. Create hierarchical structure
   Work
   └─ Project A
      ├─ Design
      └─ Implementation

2. Add symlinks for cross-references
   Work
   └─ Project A
      ├─ Design
      │  └─ 🔗 UI mockups (from Design Resources)
      └─ Implementation

3. Add tags for themes
   Design [tags: ui, priority-high]
   Implementation [tags: backend, api]

4. Use branch mode to share
   Export "Project A" branch as .dm
   → Only Project A content included
   → External symlinks preserved but marked

5. Search and navigate
   Search "ui" → finds Design + any tagged nodes
   Navigate via tree or breadcrumb
   Follow symlinks to explore connections
```

This design naturally supports DeepMemo's advanced features like PDF export (hierarchy → document structure), File System Sync (nodes → files/folders), and collaborative sharing (branch exports).

---

## Next Steps

Now that you understand the core concepts, explore:

- **[2-ARCHITECTURE.md](2-ARCHITECTURE.md)** - How these concepts are implemented
- **[3-DATA-MODEL.md](3-DATA-MODEL.md)** - The actual data structure in IndexedDB
- **[4-FEATURES.md](4-FEATURES.md)** - What you can do with DeepMemo

Or dive into specific guides:
- **[guides/FILE-FORMATS.md](guides/FILE-FORMATS.md)** - Export/import with `.dm` archives
- **[guides/FS-SYNC.md](guides/FS-SYNC.md)** - Sync with local filesystem
