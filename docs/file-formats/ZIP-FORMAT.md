# DeepMemo ZIP Export Format

**Minimal technical reference for AI/developers**

## File Structure

```
deepmemo-export-1735820000000.zip
├── data.json
└── attachments/
    ├── attach_123_abc_file1.pdf
    ├── attach_456_def_image.png
    └── ...
```

## Global Export

**File**: `deepmemo-export-{timestamp}.zip`

**data.json**:
```json
{
  "nodes": {
    "node_1": { ... },
    "node_2": { ... }
  },
  "rootNodes": ["node_1", "node_3"]
}
```

**Import behavior**:
- **Replaces ALL data** (destructive)
- Node IDs preserved
- Attachment IDs preserved
- Requires user confirmation

## Branch Export

**File**: `deepmemo-branch-{title}-{timestamp}.zip`

**data.json**:
```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123",
  "exported": 1735820000000,
  "nodeCount": 42,
  "nodes": { ... }
}
```

**Import behavior**:
- **Merges** into existing data
- Node IDs regenerated (avoid conflicts)
- Attachment IDs regenerated
- Parent-child links remapped
- Branch root becomes child of selected parent

## Attachment Naming

Format: `{attachmentId}_{originalName}`

Example: `attach_1735820000456_xyz_document.pdf`

## IndexedDB Storage

**Database**: `deepmemo-attachments`
**Store**: `files`
**Key**: attachment ID

```javascript
{
  id: "attach_123_abc",  // Primary key
  blob: Blob             // Binary data
}
```

**Metadata** (name, type, size) stored in node's `attachments` array.
**Blob** stored in IndexedDB.

## Minimal Example (Branch)

**deepmemo-branch-Tutorial-1735820000000.zip**

**data.json**:
```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_abc",
  "exported": 1735820000000,
  "nodeCount": 2,
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "title": "Tutorial",
      "content": "Welcome",
      "type": "note",
      "parent": null,
      "children": ["node_def"],
      "attachments": [
        {
          "id": "attach_xyz",
          "name": "guide.pdf",
          "type": "application/pdf",
          "size": 102400
        }
      ],
      "created": 1735820000000,
      "modified": 1735820000000
    },
    "node_def": {
      "id": "node_def",
      "title": "Step 1",
      "type": "note",
      "parent": "node_abc",
      "children": [],
      "created": 1735820000000,
      "modified": 1735820000000
    }
  }
}
```

**attachments/attach_xyz_guide.pdf**: Binary PDF file

## Key Differences

| Aspect | Global | Branch |
|--------|--------|--------|
| **Scope** | All data | Subtree only |
| **data.json** | `{nodes, rootNodes}` | `{type, version, branchRootId, exported, nodeCount, nodes}` |
| **Import** | Replace all | Merge |
| **IDs** | Preserved | Regenerated |
| **User confirmation** | Required | Optional |

## Validation

1. **data.json** must be valid JSON
2. **Attachment files** must match IDs in nodes' `attachments` arrays
3. **Missing attachments**: Import succeeds, but files won't display
4. **Extra attachments**: Ignored (no error)
5. **Branch exports**: Must have `type: "deepmemo-branch"`
