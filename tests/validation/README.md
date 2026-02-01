# Validation Tests - DeepMemo

## Quick Start

### 1. Start Local Server
```bash
cd /mnt/c/Users/parks/Documents/Dev/deepMemo/DeepMemo-refonte-doc
python -m http.server 8000
```

### 2. Run Tests
Open in browser:
```
http://localhost:8000/tests/validation/test-validation.html
```

**Expected result:** ✅ ALL TESTS PASSED - 15 / 15 tests passed

---

## Test Files

### Valid Exports (Should Pass ✅)
- `test-valid-minimal.json` - Minimal valid global export
- `test-valid-branch.json` - Valid branch export
- `test-valid-legacy-note.json` - Legacy export with type="note" (backwards compatibility)

### Invalid Exports (Should Fail ❌)
- `test-invalid-missing-id.json` - Missing required field "id"
- `test-invalid-broken-ref.json` - Broken child reference
- `test-invalid-cycle.json` - Cycle in hierarchy (A→B→C→A)
- `test-invalid-symlink-no-target.json` - Symlink without targetId

---

## Manual Testing

### Test in DeepMemo UI

1. Start server (see above)
2. Open DeepMemo: `http://localhost:8000`
3. Click **Import** button
4. Select a test file

**Valid files** → Should import successfully
**Invalid files** → Should show validation error alert

---

## What's Being Tested

### ✅ Required Fields
- `id`, `type`, `parent`, `children`, `created`, `modified`

### ✅ Type Validation
- `type` must be "node" or "symlink"
- Symlinks must have `targetId`

### ✅ Reference Validation
- `parent` (if not null) must exist
- All `children` must exist
- `targetId` (symlinks) must exist
- `rootNodes` must exist and have `parent === null`

### ✅ Cycle Detection
- No circular parent-child relationships

### ✅ Optional Fields
- `title`, `content`, `tags`, etc. are optional (not required)

---

## Automated Tests (15 Total)

1. ✅ Valid minimal export
2. ❌ Missing nodes field
3. ❌ Missing rootNodes field
4. ❌ Node missing id field
5. ❌ Invalid node type
6. ❌ Broken parent reference
7. ❌ Broken child reference
8. ❌ Symlink missing targetId
9. ❌ Cycle detection (A→B→C→A)
10. ✅ Valid branch export
11. ❌ Branch missing branchRootId
12. ✅ Valid export with symlink
13. ❌ Root node with parent
14. ✅ Accept missing optional fields
15. ✅ Legacy type "note" accepted (backwards compatibility)

---

## Troubleshooting

### Tests Don't Load
**Problem:** 404 error for validation.js

**Solution:** Make sure you're running from project root:
```bash
cd /mnt/c/Users/parks/Documents/Dev/deepMemo/DeepMemo-refonte-doc
python -m http.server 8000
```

### Service Worker Cache
**Problem:** Changes not appearing

**Solution:** Hard refresh (Ctrl+Shift+R) or disable service worker in DevTools

---

## Expected Output

### Success
```
✅ ALL TESTS PASSED
14 / 14 tests passed
```

### Failure
If a test fails, you'll see:
```
❌ SOME TESTS FAILED
12 / 14 tests passed
```

Click on failed tests to see error details.

---

**Last Updated:** 2026-02-01
