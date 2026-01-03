# DeepMemo JSON Structure

**Minimal technical reference for AI/developers**

## Node Object

```json
{
  "id": "node_1735820000123_abc",
  "title": "Node Title",
  "content": "Markdown content...",
  "type": "note",
  "parent": "parent_id",
  "children": ["child1_id", "child2_id"],
  "tags": ["tag1", "tag2"],
  "attachments": [
    {
      "id": "attach_1735820000456_xyz",
      "name": "file.pdf",
      "type": "application/pdf",
      "size": 1234567
    }
  ],
  "created": 1735820000000,
  "modified": 1735820000000
}
```

### Required Fields

- `id` (string): Format `node_{timestamp}_{random}`
- `title` (string): Node display name
- `type` (string): `"note"` or `"symlink"`
- `parent` (string|null): Parent ID, `null` for roots
- `children` (array): Child IDs
- `created` (number): Unix ms timestamp
- `modified` (number): Unix ms timestamp

### Optional Fields

- `content` (string): Markdown text
- `tags` (array): Tag strings
- `attachments` (array): Attachment objects (see below)

### Symlink Nodes

```json
{
  "id": "symlink_123_abc",
  "title": "Custom Title",
  "type": "symlink",
  "targetId": "target_node_id",
  "parent": "parent_id",
  "children": [],
  "created": 1735820000000,
  "modified": 1735820000000
}
```

**Key**: `targetId` (string) points to target node. Title stored on symlink itself.

### Attachment Objects

**CRITICAL**: MUST be array of objects, NOT strings!

```json
{
  "id": "attach_{timestamp}_{random}",
  "name": "filename.ext",
  "type": "mime/type",
  "size": 1234567
}
```

## Global Data Structure

```json
{
  "nodes": {
    "node_1": { ... },
    "node_2": { ... }
  },
  "rootNodes": ["node_1", "node_3"]
}
```

## Branch Export Structure

```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123",
  "exported": 1735820000000,
  "nodeCount": 42,
  "nodes": {
    "node_123": { ... },
    "node_124": { ... }
  }
}
```

**No `rootNodes` array in branch exports.**

## Validation Rules

1. **ID format**: `node_{timestamp}_{random}` or `attach_{timestamp}_{random}`
2. **Bidirectional links**: If A has B in children, B must have A as parent
3. **Root nodes**: `parent === null`
4. **Symlink targets**: Must exist in same dataset
5. **Attachments**: Array of objects with `id`, `name`, `type`, `size`
6. **Timestamps**: Unix milliseconds (13 digits)

## Minimal Example

```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_abc",
  "exported": 1735820000000,
  "nodeCount": 1,
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "title": "Hello",
      "content": "World",
      "type": "note",
      "parent": null,
      "children": [],
      "created": 1735820000000,
      "modified": 1735820000000
    }
  }
}
```
