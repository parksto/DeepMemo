# DeepMemo .dm Archive Format

**Quick reference for developers and AI tools**

---

## Overview

`.dm` files are **ZIP archives** containing DeepMemo data, attachments, metadata, and visual assets.

**Think of it like**:
- `.docx` (Word) = ZIP with XML + images
- `.epub` (eBook) = ZIP with HTML + CSS + images
- `.dm` (DeepMemo) = ZIP with JSON + attachments + icon

**Compatibility**: Any ZIP tool can extract `.dm` files (7zip, unzip, WinRAR, etc.)

---

## File Structure

```
export.dm (ZIP archive)
├── metadata.json          # Export metadata (required)
├── data.json             # Node tree structure (required)
└── attachments/          # Attachment files (optional)
    ├── attach_123_abc_file.pdf
    └── attach_456_def_image.png
```

**Optional files** (reserved for future use):
- `icon.png` - Visual icon for preview/desktop app
- `preview.html` - Standalone HTML preview

**All files use UTF-8 encoding**

---

## metadata.json

**Schema**: [`schemas/v1.0/metadata.json`](../schemas/v1.0/metadata.json)

### Global Export

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/metadata.json",
  "version": "1.0",
  "type": "global",
  "title": "Full Backup",
  "exported": 1737115200000,
  "nodeCount": 152,
  "attachmentCount": 12,
  "totalSize": 5242880,
  "generator": "DeepMemo v0.10.4"
}
```

### Branch Export

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/metadata.json",
  "version": "1.0",
  "type": "branch",
  "title": "Documentation",
  "exported": 1737115200000,
  "branchRootId": "node_1234567890_abc",
  "nodeCount": 42,
  "attachmentCount": 5,
  "totalSize": 1048576,
  "generator": "DeepMemo v0.10.4"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | ✅ | Format version (e.g., `"1.0"`) |
| `type` | string | ✅ | `"global"` or `"branch"` |
| `title` | string | ❌ | Human-readable export name |
| `exported` | number | ✅ | Unix timestamp (milliseconds) |
| `branchRootId` | string | ✅ (branch) | Root node ID for branches |
| `nodeCount` | number | ❌ | Total number of nodes |
| `attachmentCount` | number | ❌ | Total attachment files |
| `totalSize` | number | ❌ | Total size in bytes |
| `generator` | string | ❌ | Software identifier |

---

## data.json

**Schema**: [`schemas/v1.0/deepmemo.json`](../schemas/v1.0/deepmemo.json)

See [`JSON-STRUCTURE.md`](JSON-STRUCTURE.md) for complete node structure details.

### Global Format

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123_abc": { /* ... */ },
    "node_456_def": { /* ... */ }
  },
  "rootNodes": ["node_123_abc"]
}
```

### Branch Format

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123_abc",
  "exported": 1737115200000,
  "nodeCount": 2,
  "nodes": {
    "node_123_abc": { /* ... */ },
    "node_456_def": { /* ... */ }
  }
}
```

**Key difference**: Branch format has no `rootNodes` array (only `branchRootId`)

---

## icon.png (Optional - Future Use)

**Status**: Reserved for future functionality, not currently used

**Format**: PNG image, 512×512 pixels recommended

**Intended use cases**:
- Desktop app with custom file icons
- Embedded `preview.html` showing visual icon
- DeepMemo UI galleries

**Current implementation**:
- Not generated on export
- Ignored on import (graceful degradation)
- Filename reserved to avoid future conflicts

---

## attachments/ Folder

Contains binary attachment files referenced in `data.json`.

### Naming Convention

Format: `{attachmentId}_{originalFilename}`

Examples:
```
attach_1737115200456_xyz_document.pdf
attach_1737115300123_abc_screenshot.png
attach_1737115400789_def_report.docx
```

### Metadata Split

**In data.json** (node.attachments):
```json
{
  "id": "attach_1737115200456_xyz",
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 524288
}
```

**In attachments/ folder**:
- Binary file: `attach_1737115200456_xyz_document.pdf`

### Validation

| Scenario | Behavior |
|----------|----------|
| Missing attachment file | Import succeeds, attachment won't display |
| Extra attachment file | Ignored (no error) |
| Mismatched filename | Uses ID to match, filename is descriptive only |

---

## Import Behavior

### Global Import

**Operation**: Replace all data

| Aspect | Behavior |
|--------|----------|
| Scope | ALL existing data deleted |
| Node IDs | Preserved (no regeneration) |
| Attachment IDs | Preserved |
| User confirmation | **Required** (destructive) |
| Merge | No (full replacement) |

**Use case**: Restore complete backup, switch datasets

### Branch Import

**Operation**: Merge into existing data

| Aspect | Behavior |
|--------|----------|
| Scope | Only imported branch added |
| Node IDs | **Regenerated** (avoid conflicts) |
| Attachment IDs | **Regenerated** |
| Parent-child links | **Remapped** to new IDs |
| Root node | Becomes child of selected parent |
| User confirmation | Optional |
| Merge | Yes (safe) |

**Use case**: Import templates, add content from others

---

## Creating .dm Archives

### JavaScript Example

```javascript
import JSZip from 'jszip';

async function createDMArchive(branchRootId) {
  const zip = new JSZip();

  // 1. Generate metadata
  const metadata = {
    version: '1.0',
    type: 'branch',
    title: rootNode.title,
    exported: Date.now(),
    branchRootId,
    nodeCount: nodes.length,
    attachmentCount: attachments.length,
    totalSize: calculateTotalSize(attachments),
    generator: 'DeepMemo v0.10.4'
  };
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // 2. Generate data.json
  const data = generateBranchData(branchRootId);
  zip.file('data.json', JSON.stringify(data, null, 2));

  // 3. Add icon (optional - future use)
  // const iconBlob = await generateIconPNG(rootNode.title);
  // zip.file('icon.png', iconBlob);

  // 4. Add attachments
  for (const attachment of attachments) {
    const blob = await Storage.getAttachment(attachment.id);
    zip.file(`attachments/${attachment.id}_${attachment.name}`, blob);
  }

  // 5. Generate archive
  const dmBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(dmBlob, `${sanitize(rootNode.title)}.dm`);
}
```

### Python Example

```python
import zipfile
import json
from datetime import datetime

def create_dm_archive(output_path, data, attachments):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        # metadata.json
        metadata = {
            'version': '1.0',
            'type': 'branch',
            'exported': int(datetime.now().timestamp() * 1000),
            'nodeCount': len(data['nodes'])
        }
        zf.writestr('metadata.json', json.dumps(metadata, indent=2))

        # data.json
        zf.writestr('data.json', json.dumps(data, indent=2))

        # icon.png (optional - future use)
        # if icon_path:
        #     zf.write(icon_path, 'icon.png')

        # attachments/
        for attach_id, file_path, filename in attachments:
            zf.write(file_path, f'attachments/{attach_id}_{filename}')
```

---

## Reading .dm Archives

### JavaScript Example

```javascript
import JSZip from 'jszip';

async function readDMArchive(file) {
  const zip = await JSZip.loadAsync(file);

  // 1. Read metadata
  const metadataJson = await zip.file('metadata.json').async('string');
  const metadata = JSON.parse(metadataJson);

  // 2. Read data
  const dataJson = await zip.file('data.json').async('string');
  const data = JSON.parse(dataJson);

  // 3. Read attachments
  const attachments = {};
  const attachmentsFolder = zip.folder('attachments');
  if (attachmentsFolder) {
    for (const [filename, file] of Object.entries(attachmentsFolder.files)) {
      if (!file.dir) {
        const blob = await file.async('blob');
        const attachId = filename.split('_')[0]; // Extract ID
        attachments[attachId] = blob;
      }
    }
  }

  return { metadata, data, attachments };
}
```

### Python Example

```python
import zipfile
import json

def read_dm_archive(archive_path):
    with zipfile.ZipFile(archive_path, 'r') as zf:
        # Read metadata
        metadata = json.loads(zf.read('metadata.json'))

        # Read data
        data = json.loads(zf.read('data.json'))

        # Extract attachments
        attachments = {}
        for name in zf.namelist():
            if name.startswith('attachments/'):
                attach_id = name.split('/')[-1].split('_')[0]
                attachments[attach_id] = zf.read(name)

        return metadata, data, attachments
```

---

## Validation Checklist

When reading/writing `.dm` archives:

**Required**:
- ✅ Valid ZIP structure (can be extracted)
- ✅ `metadata.json` exists and validates against schema
- ✅ `data.json` exists and validates against schema
- ✅ Attachment IDs in `data.json` match files in `attachments/`
- ✅ All JSON files are UTF-8 encoded
- ✅ Node parent-child relationships are bidirectional
- ✅ Timestamps are valid Unix milliseconds

**Optional** (graceful degradation):
- ⚠️ `icon.png` → Ignored (reserved for future use)
- ⚠️ Missing attachments → Import succeeds, files won't display
- ⚠️ Extra files → Ignored

---

## Version History

- **2.0** (2026-01-17): Renamed to .dm format
  - Added `metadata.json` specification
  - Reserved `icon.png` filename for future use
  - Clarified import behavior differences
  - Simplified initial implementation (icon.png optional)

- **1.0** (2026-01-02): Initial ZIP format
  - `data.json` + `attachments/` structure
  - Global and branch export types

---

## See Also

- [FILE-FORMATS.md](../FILE-FORMATS.md) - Complete format documentation
- [JSON-STRUCTURE.md](JSON-STRUCTURE.md) - Node structure details
- [schemas/v1.0/deepmemo.json](../schemas/v1.0/deepmemo.json) - Data schema
- [schemas/v1.0/metadata.json](../schemas/v1.0/metadata.json) - Metadata schema
