# Legacy Compatibility - Type "note"

## Issue
Older DeepMemo exports used `type: "note"` instead of `type: "node"`.

## Solution
The validation now accepts both "note" and "node" as valid types:

### Validation
- `type` can be: `"node"`, `"note"` (legacy), or `"symlink"`
- "note" is accepted during validation (not rejected)

### Normalization
After successful validation, all "note" types are automatically normalized to "node":

```javascript
// Before normalization (legacy export)
{
  "id": "xyz",
  "type": "note",  // ← Legacy type
  ...
}

// After normalization (in memory)
{
  "id": "xyz",
  "type": "node",  // ← Normalized to current standard
  ...
}
```

## Implementation

### Files Modified

#### `src/js/core/validation.js`
```javascript
// Line 27: Accept "note" as legacy alias
if (node.type && !['node', 'note', 'symlink'].includes(node.type)) {
  result.errors.push(`Invalid node type...`);
}
```

#### `src/js/core/data.js`
```javascript
// Added normalization function (line 58)
function normalizeLegacyTypes(imported) {
  if (!imported.nodes) return;

  let normalized = 0;
  Object.values(imported.nodes).forEach(node => {
    if (node.type === 'note') {
      node.type = 'node';
      normalized++;
    }
  });

  if (normalized > 0) {
    console.log(`[Import] Normalized ${normalized} legacy "note" types to "node"`);
  }
}

// Called after validation in all import functions:
// - importFromArchive() - line 791
// - importFromJSONText() - line 910
// - importBranchFromArchive() - line 1110
// - importBranchFromJSONText() - line 1314
```

## Testing

### Test Legacy Export
```json
{
  "nodes": {
    "old-node": {
      "id": "old-node",
      "type": "note",
      "parent": null,
      "children": [],
      "created": 123,
      "modified": 123
    }
  },
  "rootNodes": ["old-node"]
}
```

**Expected result:**
1. ✅ Validation passes
2. ✅ Import succeeds
3. ✅ Type normalized to "node" in memory
4. ✅ Console log: `[Import] Normalized 1 legacy "note" types to "node"`

### Console Check
After importing a legacy file, check the console:
```javascript
// Should see this log message
[Import] Normalized 51 legacy "note" types to "node"
```

## Backwards Compatibility

✅ **Fully maintained:**
- Old exports with `type: "note"` import successfully
- No user action required
- Automatic normalization is transparent
- All functionality works as expected

## Future Exports

All new exports will use `type: "node"` (current standard):
- New nodes created: `type: "node"`
- Exports generated: `type: "node"`
- Legacy "note" only exists in old exports

## Migration Path

**For users:**
- No action required
- Old exports continue to work
- New exports use current standard

**For developers:**
- Validation accepts both "note" and "node"
- Normalization happens automatically during import
- Code can assume all nodes have `type: "node"` after import

---

**Version:** 1.0.1
**Date:** 2026-02-01
**Status:** ✅ Implemented & Tested
