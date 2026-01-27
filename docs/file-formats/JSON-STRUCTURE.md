# DeepMemo JSON Interchange Format

**Quick reference for LLM generation and scripting**

---

## Overview

The JSON interchange format is a **lightweight, standalone JSON file** for technical use cases.

**Use when**:
- ✅ AI/LLM generation (ChatGPT, Claude, etc.)
- ✅ Manual editing in text editor
- ✅ Scripting and automation
- ✅ Sharing branches without attachments

**Limitation**:
- ❌ Cannot include attachment **files** (only metadata)
- ❌ For complete exports with attachments, use [`.dm` format](ZIP-FORMAT.md)

**Schema**: [`schemas/v1.0/deepmemo.json`](../../schemas/v1.0/deepmemo.json)

---

## Node Structure

Every node has this structure:

```json
{
  "id": "node_1737115200000_abc",
  "title": "Node Title",
  "content": "Markdown content...",
  "type": "note",
  "parent": "parent_id",
  "children": ["child1_id", "child2_id"],
  "tags": ["tag1", "tag2"],
  "attachments": [
    {
      "id": "attach_1737115200456_xyz",
      "name": "file.pdf",
      "type": "application/pdf",
      "size": 1234567
    }
  ],
  "created": 1737115200000,
  "modified": 1737115200000
}
```

### Required Fields

| Field | Type | Format | Description |
|-------|------|--------|-------------|
| `id` | string | `node_{timestamp}_{random}` | Unique identifier |
| `title` | string | Any text | Node name (can include emojis) |
| `type` | string | `"note"` or `"symlink"` | Node type |
| `parent` | string\|null | Node ID or `null` | Parent ID (`null` for roots) |
| `children` | array | Array of node IDs | Child node IDs |
| `created` | number | Unix ms | Creation timestamp |
| `modified` | number | Unix ms | Last modification timestamp |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | Markdown text content |
| `tags` | array | Array of tag strings |
| `attachments` | array | Attachment metadata (see below) |

### ID Format

**Node IDs**: `node_{timestamp}_{random}` or `symlink_{timestamp}_{random}`

Examples:
- `node_1737115200000_abc`
- `symlink_1737115300123_xyz`

**Attachment IDs**: `attach_{timestamp}_{random}`

Example: `attach_1737115400456_def`

**Timestamp**: Unix milliseconds (13 digits)
**Random**: Lowercase alphanumeric string (e.g., `abc`, `xyz123`)

---

## Symlink Nodes

Symlinks reference other nodes with a `targetId` field:

```json
{
  "id": "symlink_1737115200000_xyz",
  "title": "Custom Symlink Title",
  "type": "symlink",
  "targetId": "node_123_abc",
  "parent": "parent_id",
  "children": [],
  "created": 1737115200000,
  "modified": 1737115200000
}
```

**Key differences**:
- `type` must be `"symlink"`
- `targetId` is **required** (points to target node)
- `title` is stored on symlink itself (can differ from target)
- Typically no `content` or `children`

---

## Attachment Objects

⚠️ **CRITICAL**: Attachments MUST be an **array of objects**, NOT strings!

```json
{
  "id": "attach_1737115200456_xyz",
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 1234567
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (`attach_{timestamp}_{random}`) |
| `name` | string | Original filename with extension |
| `type` | string | MIME type (e.g., `image/png`) |
| `size` | number | File size in bytes |

### Important Notes

**In JSON interchange format**:
- ✅ You **can** include attachment metadata
- ❌ You **cannot** include the actual files
- ℹ️ Files must be uploaded separately after import

**For complete export with files**, use [`.dm` format](ZIP-FORMAT.md).

---

## Global Export Format

**Use case**: Export all data from DeepMemo

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123_abc": {
      "id": "node_123_abc",
      "title": "Root Node",
      "type": "note",
      "parent": null,
      "children": ["node_456_def"],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_456_def": {
      "id": "node_456_def",
      "title": "Child Node",
      "type": "note",
      "parent": "node_123_abc",
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  },
  "rootNodes": ["node_123_abc"]
}
```

### Structure

| Field | Type | Description |
|-------|------|-------------|
| `nodes` | object | Dictionary of all nodes, keyed by ID |
| `rootNodes` | array | IDs of root-level nodes |

### Import Behavior

- **Destructive**: Replaces ALL existing data
- Node IDs are **preserved**
- User MUST confirm (all current data will be lost)

---

## Branch Export Format

**Use case**: Export a subtree from DeepMemo, or **generate with LLM**

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123_abc",
  "exported": 1737115200000,
  "nodeCount": 2,
  "nodes": {
    "node_123_abc": {
      "id": "node_123_abc",
      "title": "Branch Root",
      "content": "# Welcome\n\nThis is a branch.",
      "type": "note",
      "parent": null,
      "children": ["node_456_def"],
      "tags": ["tutorial"],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_456_def": {
      "id": "node_456_def",
      "title": "Child",
      "content": "Child content...",
      "type": "note",
      "parent": "node_123_abc",
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  }
}
```

### Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | Always `"deepmemo-branch"` |
| `version` | string | ✅ | Format version (`"1.0"`) |
| `branchRootId` | string | ✅ | ID of the branch root node |
| `exported` | number | ✅ | Export timestamp (Unix ms) |
| `nodeCount` | number | ✅ | Total number of nodes |
| `nodes` | object | ✅ | Dictionary of nodes |

**No `rootNodes` array** in branch format (only `branchRootId`).

### Import Behavior

- **Non-destructive**: Merges into existing data
- Node IDs are **regenerated** to avoid conflicts
- Parent-child relationships are **remapped**
- Branch root becomes child of selected parent

---

## LLM Generation Guide

### Prompt Template

**For ChatGPT, Claude, or other AI**:

> Generate a DeepMemo branch in JSON format about **[TOPIC]** with the following structure:
> - Root node: "[ROOT TITLE]"
> - Child nodes: "[CHILD 1]", "[CHILD 2]", "[CHILD 3]"
> - Each node should have markdown content explaining the concept
> - Use realistic timestamps
> - Follow the DeepMemo JSON interchange format
>
> Structure:
> ```json
> {
>   "type": "deepmemo-branch",
>   "version": "1.0",
>   "branchRootId": "node_{current_timestamp}_{random}",
>   "exported": {current_timestamp_ms},
>   "nodeCount": {total_count},
>   "nodes": { /* ... */ }
> }
> ```

### Node Template

```json
{
  "id": "node_{timestamp}_{random}",
  "title": "Node Title Here",
  "content": "# Title\n\nMarkdown content here...\n\n- Bullet point\n- Another point",
  "type": "note",
  "parent": "parent_id_or_null",
  "children": ["child1_id", "child2_id"],
  "tags": ["tag1", "tag2"],
  "created": {timestamp_ms},
  "modified": {timestamp_ms}
}
```

### Best Practices

1. **Unique IDs**: Always generate unique IDs (never reuse)
2. **Realistic timestamps**: Use current Unix time in milliseconds
3. **Bidirectional links**: If A has B in `children`, B must have A as `parent`
4. **Root nodes**: Use `parent: null` for root nodes
5. **Markdown content**: Supports full CommonMark spec
6. **Tags**: Optional, use array of strings
7. **Symlinks**: Ensure `targetId` points to existing node in dataset

### Example Generation

**Prompt**:
> Generate a DeepMemo branch about "Machine Learning Basics"

**LLM Output**:
```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_1737115200000_abc",
  "exported": 1737115200000,
  "nodeCount": 4,
  "nodes": {
    "node_1737115200000_abc": {
      "id": "node_1737115200000_abc",
      "title": "📚 Machine Learning Basics",
      "content": "# Machine Learning Basics\n\nAn introduction to core ML concepts.",
      "type": "note",
      "parent": null,
      "children": [
        "node_1737115200001_def",
        "node_1737115200002_ghi",
        "node_1737115200003_jkl"
      ],
      "tags": ["ml", "tutorial"],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_1737115200001_def": {
      "id": "node_1737115200001_def",
      "title": "Supervised Learning",
      "content": "# Supervised Learning\n\nLearning from labeled data...",
      "type": "note",
      "parent": "node_1737115200000_abc",
      "children": [],
      "tags": ["ml"],
      "created": 1737115200001,
      "modified": 1737115200001
    },
    "node_1737115200002_ghi": {
      "id": "node_1737115200002_ghi",
      "title": "Unsupervised Learning",
      "content": "# Unsupervised Learning\n\nFinding patterns in unlabeled data...",
      "type": "note",
      "parent": "node_1737115200000_abc",
      "children": [],
      "tags": ["ml"],
      "created": 1737115200002,
      "modified": 1737115200002
    },
    "node_1737115200003_jkl": {
      "id": "node_1737115200003_jkl",
      "title": "Neural Networks",
      "content": "# Neural Networks\n\nBrain-inspired computing models...",
      "type": "note",
      "parent": "node_1737115200000_abc",
      "children": [],
      "tags": ["ml", "deep-learning"],
      "created": 1737115200003,
      "modified": 1737115200003
    }
  }
}
```

---

## Validation Rules

### ID Formats

**Regex patterns**:
- Node IDs: `^(node|symlink)_\d+_[a-z0-9]+$`
- Attachment IDs: `^attach_\d+_[a-z0-9]+$`

**Valid examples**:
- ✅ `node_1737115200000_abc`
- ✅ `symlink_1737115300123_xyz123`
- ✅ `attach_1737115400456_def`

**Invalid examples**:
- ❌ `node_abc` (missing timestamp)
- ❌ `node_1234_ABC` (uppercase not allowed)
- ❌ `node_1234_abc_def` (too many underscores)

### Relationships

**Bidirectional consistency**:
- If A has B in `children`, B MUST have A as `parent`
- Root nodes MUST have `parent === null`
- All child IDs MUST reference existing nodes

**Symlinks**:
- Symlink nodes MUST have `targetId`
- `targetId` MUST point to an existing node
- Regular notes MUST NOT have `targetId`

### Timestamps

- Must be **Unix milliseconds** (13 digits)
- Must be `>= 0`
- `modified` should be `>= created`

### Attachments

- ⚠️ **MUST be array of objects**, NOT array of strings
- Each object MUST have: `id`, `name`, `type`, `size`
- `size` must be `>= 0`

---

## Common Mistakes

### ❌ Incorrect: Attachments as strings

```json
{
  "attachments": ["attach_123_abc", "attach_456_def"]
}
```

### ✅ Correct: Attachments as objects

```json
{
  "attachments": [
    {
      "id": "attach_123_abc",
      "name": "file1.pdf",
      "type": "application/pdf",
      "size": 1234567
    },
    {
      "id": "attach_456_def",
      "name": "image.png",
      "type": "image/png",
      "size": 987654
    }
  ]
}
```

### ❌ Incorrect: Broken parent-child relationship

```json
{
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "children": ["node_def"]
    },
    "node_def": {
      "id": "node_def",
      "parent": "node_xyz"  // ❌ Inconsistent!
    }
  }
}
```

### ✅ Correct: Bidirectional consistency

```json
{
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "children": ["node_def"]
    },
    "node_def": {
      "id": "node_def",
      "parent": "node_abc"  // ✅ Matches!
    }
  }
}
```

---

## Minimal Example

Simplest valid branch with one node:

```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_1737115200000_abc",
  "exported": 1737115200000,
  "nodeCount": 1,
  "nodes": {
    "node_1737115200000_abc": {
      "id": "node_1737115200000_abc",
      "title": "Hello World",
      "content": "# Hello\n\nThis is a minimal example.",
      "type": "note",
      "parent": null,
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  }
}
```

---

## Complete Example with Symlink

Branch with root node, child, and symlink:

```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_root",
  "exported": 1737115200000,
  "nodeCount": 3,
  "nodes": {
    "node_root": {
      "id": "node_root",
      "title": "📁 Project",
      "content": "# My Project\n\nMain project hub.",
      "type": "note",
      "parent": null,
      "children": ["node_task", "symlink_ref"],
      "tags": ["project"],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_task": {
      "id": "node_task",
      "title": "📝 Task List",
      "content": "# Tasks\n\n- [ ] Task 1\n- [ ] Task 2",
      "type": "note",
      "parent": "node_root",
      "children": [],
      "tags": ["tasks"],
      "created": 1737115200001,
      "modified": 1737115200001
    },
    "symlink_ref": {
      "id": "symlink_ref",
      "title": "🔗 Quick Reference",
      "type": "symlink",
      "targetId": "node_task",
      "parent": "node_root",
      "children": [],
      "created": 1737115200002,
      "modified": 1737115200002
    }
  }
}
```

---

## See Also

- [FILE-FORMATS.md](../FILE-FORMATS.md) - Complete format documentation
- [ZIP-FORMAT.md](ZIP-FORMAT.md) - `.dm` archive format (for attachments)
- [schemas/deepmemo-v1.0.json](../schemas/deepmemo-v1.0.json) - JSON Schema
- [JSON Schema Specification](https://json-schema.org/)
