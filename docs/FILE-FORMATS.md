# DeepMemo File Formats Reference

**Version:** 2.0
**Last updated:** 2026-01-17

This document describes all file formats used by DeepMemo for data export and import.

---

## Table of Contents

1. [Overview](#overview)
2. [.dm Archive Format (Standard)](#dm-archive-format-standard)
3. [.json Interchange Format](#json-interchange-format)
4. [Export Formats (Read-Only)](#export-formats-read-only)
5. [JSON Schema Validation](#json-schema-validation)
6. [Migration from v1.0](#migration-from-v10)

---

## Overview

DeepMemo uses **two primary formats** for data export/import:

### `.dm` (DeepMemo Archive) - **Standard Format**

The official DeepMemo file format. Think of it like `.docx` for Word or `.psd` for Photoshop.

- ✅ **Complete**: Includes data + attachments + metadata + icon
- ✅ **Future-proof**: ZIP-based, extensible without breaking changes
- ✅ **OS integration**: Custom file extension with icon
- ✅ **Recommended** for all exports (global or branch)

**File structure**: ZIP archive containing `data.json`, `metadata.json`, `icon.png`, and `attachments/` folder.

### `.json` (Interchange Format) - **Technical/LLM Use**

A simple JSON file for specific technical use cases.

- ✅ **LLM-friendly**: ChatGPT/Claude can generate this directly
- ✅ **Editable**: Plain text, easy to modify with scripts
- ✅ **Lightweight**: No attachments, no metadata
- ⚠️ **Limitation**: Cannot include attachment files (metadata only)

**Use when**: Generating data with AI, manual editing, ultra-lightweight sharing.

---

## .dm Archive Format (Standard)

### File Structure

A `.dm` file is a **ZIP archive** with the following structure:

```
export.dm (ZIP archive)
├── metadata.json          # Export metadata (version, type, date, etc.)
├── data.json             # Complete node tree structure
└── attachments/          # Attachment files (if any)
    ├── attach_123_abc_document.pdf
    ├── attach_456_def_image.png
    └── ...
```

**Optional files** (reserved for future use):
- `icon.png` - Visual icon (512×512) for preview/desktop app
- `preview.html` - Standalone HTML preview

**Note**: The `.dm` file is a standard ZIP archive - you can extract it with any ZIP tool (7zip, unzip, etc.).

### metadata.json

Contains information about the export itself:

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

**Fields**:
- `version` (string, required): Format version (`"1.0"`)
- `type` (string, required): `"global"` or `"branch"`
- `title` (string, optional): Human-readable export name
- `exported` (number, required): Export timestamp (Unix milliseconds)
- `branchRootId` (string, required for branch): Root node ID
- `nodeCount` (number, optional): Total nodes
- `attachmentCount` (number, optional): Total attachment files
- `totalSize` (number, optional): Total attachments size in bytes
- `generator` (string, optional): Exporting software identifier

**Schema**: [`schemas/v1.0/metadata.json`](../schemas/v1.0/metadata.json)

### data.json

Contains the complete node tree. Format depends on export type.

#### Global Export

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123_abc": {
      "id": "node_123_abc",
      "title": "My Node",
      "content": "Markdown content...",
      "type": "note",
      "parent": null,
      "children": ["node_456_def"],
      "tags": ["important"],
      "attachments": [],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_456_def": { /* ... */ }
  },
  "rootNodes": ["node_123_abc"]
}
```

**Structure**:
- `nodes` (object): Dictionary of all nodes, keyed by node ID
- `rootNodes` (array): IDs of root-level nodes

#### Branch Export

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

**Structure**:
- `type` (string): Always `"deepmemo-branch"`
- `version` (string): Format version (`"1.0"`)
- `branchRootId` (string): ID of the branch root
- `exported` (number): Export timestamp
- `nodeCount` (number): Number of nodes in branch
- `nodes` (object): Dictionary of branch nodes only

**No `rootNodes` array** in branch exports.

**Schema**: [`schemas/v1.0/deepmemo.json`](../schemas/v1.0/deepmemo.json)

### Node Structure

Every node has the following structure:

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
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1234567
    }
  ],
  "created": 1737115200000,
  "modified": 1737115200000
}
```

**Required fields**:
- `id` (string): Unique ID, format `node_{timestamp}_{random}`
- `title` (string): Node name/title (can include emojis)
- `type` (string): `"note"` or `"symlink"`
- `parent` (string|null): Parent node ID, `null` for roots
- `children` (array): Child node IDs
- `created` (number): Creation timestamp (Unix ms)
- `modified` (number): Last modification timestamp (Unix ms)

**Optional fields**:
- `content` (string): Markdown text content
- `tags` (array): Tag strings
- `attachments` (array): Attachment metadata objects (see below)

#### Symlink Nodes

Symlinks have an additional `targetId` field:

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

**Important**:
- The `title` is stored on the symlink itself (can differ from target)
- Symlinks typically have no `content` or `children`
- `targetId` must point to an existing node in the dataset

#### Attachment Objects

⚠️ **CRITICAL**: Attachments MUST be an **array of objects**, NOT strings!

```json
{
  "id": "attach_1737115200456_xyz",
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 1234567
}
```

**Fields**:
- `id` (string): Unique ID, format `attach_{timestamp}_{random}`
- `name` (string): Original filename with extension
- `type` (string): MIME type (e.g., `"image/png"`, `"application/pdf"`)
- `size` (number): File size in bytes

**Storage split**:
- **Metadata** (id, name, type, size): Stored in `data.json`
- **Blob** (actual file): Stored in `attachments/` folder

### icon.png (Optional - Future Use)

**Status**: Optional file, reserved for future functionality

**Format**: PNG image, 512×512 pixels recommended

**Intended use cases**:
- Desktop application with custom file icons (requires Tauri/Electron app)
- Embedded HTML preview (`preview.html`) showing visual icon
- DeepMemo UI "recent exports" gallery

**Current implementation**:
- ❌ Not generated on export
- ❌ Ignored on import (if present)
- ℹ️ Specification reserves this filename to avoid conflicts in future versions

**Future generation** (when implemented):
- Extract emoji from root node title, render as PNG
- Fallback to DeepMemo default icon
- User-uploaded custom icons

### attachments/ Folder

Contains the actual attachment files.

**Naming convention**: `{attachmentId}_{originalName}`

Example:
```
attachments/
├── attach_1737115200456_xyz_document.pdf
└── attach_1737115300123_abc_screenshot.png
```

**Validation**:
- Files MUST match IDs referenced in nodes' `attachments` arrays
- Missing files: Import succeeds, but attachments won't display
- Extra files: Ignored (no error)

### Import Behavior

#### Global Import

- **Replaces ALL existing data** (destructive operation)
- Node IDs are **preserved** (no regeneration)
- Attachment IDs are **preserved**
- User MUST confirm (all current data will be lost)

#### Branch Import

- **Merges** into existing data (non-destructive)
- Node IDs are **regenerated** to avoid conflicts
- Attachment IDs are **regenerated**
- Parent-child relationships are **remapped**
- Branch root becomes child of selected parent node

---

## .json Interchange Format

### Purpose

A **simple JSON file** for technical use cases where the full `.dm` format is not needed.

**Use cases**:
- ✅ **AI/LLM generation**: ChatGPT, Claude, etc. can generate JSON directly
- ✅ **Manual editing**: Modify structure in a text editor
- ✅ **Scripting**: Parse/manipulate with standard JSON tools
- ✅ **Lightweight sharing**: Branches without attachments

**Limitations**:
- ❌ **No attachment files** (only metadata references)
- ❌ **No metadata** (version, export date, icon, etc.)
- ❌ **Not the standard format** (use `.dm` for complete exports)

### File Structure

The `.json` file contains **only the data tree**, no metadata or attachments.

#### Global Format

```json
{
  "nodes": {
    "node_123_abc": { /* ... */ },
    "node_456_def": { /* ... */ }
  },
  "rootNodes": ["node_123_abc"]
}
```

#### Branch Format

```json
{
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

**Schema**: Same as `data.json` in `.dm` archives - [`schemas/v1.0/deepmemo.json`](schemas/v1.0/deepmemo.json)

### Generating with AI/LLM

**Prompt template for ChatGPT/Claude**:

> Generate a DeepMemo branch in JSON format with the following structure:
> - Root node: "Machine Learning Basics"
> - Child nodes: "Supervised Learning", "Unsupervised Learning", "Neural Networks"
> - Each node should have markdown content explaining the concept
> - Use the DeepMemo JSON interchange format
>
> Follow this structure:
> ```json
> {
>   "type": "deepmemo-branch",
>   "version": "1.0",
>   "branchRootId": "node_{timestamp}_{random}",
>   "exported": {current_timestamp_ms},
>   "nodeCount": {total_nodes},
>   "nodes": { /* ... */ }
> }
> ```

**Node structure template**:
```json
{
  "id": "node_{timestamp}_{random}",
  "title": "Node Title",
  "content": "Markdown content here...",
  "type": "note",
  "parent": "parent_id_or_null",
  "children": [],
  "tags": [],
  "created": {timestamp_ms},
  "modified": {timestamp_ms}
}
```

**Best practices for LLM generation**:
1. Use realistic timestamps (current Unix time in milliseconds)
2. Ensure bidirectional parent-child links
3. Generate unique IDs (never reuse)
4. Use `null` for root node parents
5. Include markdown content (supports full CommonMark spec)
6. Can reference attachments in metadata, but cannot include files

### Import

DeepMemo **automatically detects** and accepts both `.dm` and `.json` formats:

```javascript
// Auto-detection based on file extension
if (file.name.endsWith('.dm')) {
  // Extract ZIP, read data.json + attachments
} else if (file.name.endsWith('.json')) {
  // Parse JSON directly
}
```

---

## Export Formats (Read-Only)

DeepMemo can export to additional formats for **external use** (not importable):

### 1. FreeMind .mm (Mindmap)

XML-based mindmap format compatible with FreeMind/Freeplane/XMind.

**Features**:
- Hierarchical structure preserved
- Symlinks rendered with orange color + arrow links
- Node content stored in `<richcontent>` elements
- Emojis removed from titles for compatibility

**Use case**: Edit/view in external mindmap software

**Details**: See [file-formats/FREEMIND-FORMAT.md](file-formats/FREEMIND-FORMAT.md) (to be created)

### 2. Mermaid SVG (Visual Diagram)

Rendered Mermaid mindmap exported as SVG vector graphics.

**Features**:
- Visual tree representation
- Fully rendered, ready to view
- Symlinks marked with 🔗 prefix
- Scalable vector format

**Use case**: Include diagrams in documentation, presentations

**Details**: See [file-formats/MERMAID-FORMAT.md](file-formats/MERMAID-FORMAT.md) (to be created)

### 3. PDF Document

PDF export for printable documentation and long-term archiving.

**Features**:
- Symlinks automatically resolved with their content
- Inline images (attachments converted to base64)
- Hierarchical table of contents
- Responsive formatting for print

**Two implementations**:
1. **Online**: CloudFlare Worker with Browser Rendering API
   - Rate limiting (5 PDFs/hour, 20/day) to prevent abuse
   - IP hashed (SHA-256) for privacy
   - **Status**: Functional code, not deployed to production yet
2. **Offline**: CLI tool with Puppeteer (`bin/branch2pdf.js`)
   - 100% local generation
   - No rate limits
   - Requires Node.js

**Details**: See [`cloudflare-worker/README.md`](../cloudflare-worker/README.md)

---

## JSON Schema Validation

All JSON structures are validated against formal JSON Schemas.

### Available Schemas

1. **Data structure**: [`schemas/v1.0/deepmemo.json`](schemas/v1.0/deepmemo.json)
   - Validates `data.json` content
   - Supports both global and branch formats
   - Validates nodes, attachments, relationships

2. **Metadata**: [`schemas/v1.0/metadata.json`](schemas/v1.0/metadata.json)
   - Validates `metadata.json` in `.dm` archives
   - Ensures required fields are present

### Usage

**Validation example (JavaScript)**:

```javascript
import Ajv from 'ajv';

// Load schema
const schema = await fetch('schemas/v1.0/deepmemo.json')
  .then(r => r.json());

// Compile validator
const ajv = new Ajv();
const validate = ajv.compile(schema);

// Validate data
const valid = validate(importedData);
if (!valid) {
  console.error('Validation errors:', validate.errors);
  throw new Error('Invalid DeepMemo data format');
}
```

**Validation example (CLI)**:

```bash
# Using ajv-cli
npm install -g ajv-cli
ajv validate -s schemas/v1.0/deepmemo.json -d export-data.json
```

### Validation Rules

**ID formats**:
- Node IDs: `^(node|symlink)_\d+_[a-z0-9]+$`
- Attachment IDs: `^attach_\d+_[a-z0-9]+$`

**Relationships**:
- If A has B in `children`, B must have A as `parent`
- Root nodes must have `parent === null`
- Symlinks must have `targetId` pointing to existing node

**Timestamps**:
- Unix milliseconds (13 digits)
- Must be >= 0

**Attachments**:
- Must be array of objects (not strings!)
- Each attachment must have `id`, `name`, `type`, `size`

---

## Migration from v1.0

**Changes in v2.0**:

1. **New standard format**: `.dm` (ZIP archive) replaces standalone JSON as the recommended export format
2. **Metadata file**: Added `metadata.json` to all `.dm` exports
3. **Icon support**: Added `icon.png` to archives
4. **JSON renamed**: Standalone JSON is now "interchange format" (not primary format)

**Backward compatibility**:
- ✅ Old `.json` exports still work (auto-detected on import)
- ✅ Old ZIP exports without metadata still work (metadata optional)
- ✅ No breaking changes to `data.json` structure

**Migration**:
- No action required - existing exports continue to work
- New exports default to `.dm` format
- Users can still export `.json` for LLM workflows

---

## Examples

### Complete .dm Archive (Branch)

**File**: `documentation.dm`

**Contents**:

**`metadata.json`**:
```json
{
  "version": "1.0",
  "type": "branch",
  "title": "Documentation",
  "exported": 1737115200000,
  "branchRootId": "node_abc",
  "nodeCount": 3,
  "attachmentCount": 1,
  "totalSize": 524288,
  "generator": "DeepMemo v0.10.4"
}
```

**`data.json`**:
```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_abc",
  "exported": 1737115200000,
  "nodeCount": 3,
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "title": "📚 Documentation",
      "content": "# Welcome\n\nMain documentation hub.",
      "type": "note",
      "parent": null,
      "children": ["node_def", "symlink_ghi"],
      "tags": ["docs"],
      "attachments": [
        {
          "id": "attach_123",
          "name": "spec.pdf",
          "type": "application/pdf",
          "size": 524288
        }
      ],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_def": {
      "id": "node_def",
      "title": "Getting Started",
      "content": "## Installation\n\n...",
      "type": "note",
      "parent": "node_abc",
      "children": [],
      "tags": [],
      "attachments": [],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "symlink_ghi": {
      "id": "symlink_ghi",
      "title": "Quick Reference",
      "type": "symlink",
      "targetId": "node_def",
      "parent": "node_abc",
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  }
}
```

**`attachments/attach_123_spec.pdf`**: Binary PDF file

---

## See Also

- [JSON Schema Specification](https://json-schema.org/)
- [SPEC-ATTACHMENTS.md](SPEC-ATTACHMENTS.md) - Detailed attachment system
- [STORAGE.md](STORAGE.md) - IndexedDB storage structure
- [I18N.md](I18N.md) - Internationalization
- [CloudFlare Worker README](../cloudflare-worker/README.md) - PDF export

---

## Version History

- **2.0** (2026-01-17): Major revision
  - `.dm` archive format as new standard
  - Added `metadata.json` specification
  - Added JSON Schema validation
  - Renamed JSON to "interchange format"
  - Added icon support
  - Clarified LLM generation workflow

- **1.0** (2026-01-02): Initial specification
  - ZIP archive format (global + branch)
  - FreeMind .mm export
  - Mermaid SVG export
  - IndexedDB structure
  - Complete data model documentation
