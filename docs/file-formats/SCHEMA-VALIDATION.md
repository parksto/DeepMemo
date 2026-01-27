# JSON Schema Validation Guide

**How to validate DeepMemo data using JSON Schema**

---

## Overview

DeepMemo provides **formal JSON Schemas** for validating data structures:

1. **Data schema** ([`schemas/v1.0/deepmemo.json`](../schemas/v1.0/deepmemo.json))
   - Validates node trees (global and branch formats)
   - Ensures correct node structure, IDs, relationships

2. **Metadata schema** ([`schemas/v1.0/metadata.json`](../schemas/v1.0/metadata.json))
   - Validates metadata.json in .dm archives
   - Ensures required fields are present

**Why validate?**
- ✅ Catch errors before import
- ✅ Ensure data integrity
- ✅ Test LLM-generated content
- ✅ Debug export/import issues

---

## Quick Start

### JavaScript (Browser/Node.js)

**Install AJV**:
```bash
npm install ajv
```

**Validate data**:
```javascript
import Ajv from 'ajv';

// Load schema
const schema = await fetch('schemas/v1.0/deepmemo.json')
  .then(r => r.json());

// Compile validator
const ajv = new Ajv();
const validate = ajv.compile(schema);

// Validate data
const data = { /* your DeepMemo data */ };
const valid = validate(data);

if (!valid) {
  console.error('Validation errors:', validate.errors);
} else {
  console.log('Data is valid!');
}
```

### Command Line (ajv-cli)

**Install**:
```bash
npm install -g ajv-cli
```

**Validate file**:
```bash
ajv validate -s schemas/v1.0/deepmemo.json -d export.json
```

**Output**:
```
export.json valid
```

---

## Validation Examples

### Valid Branch Export

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
      "title": "Hello",
      "content": "World",
      "type": "note",
      "parent": null,
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  }
}
```

**Validation result**: ✅ Valid

### Invalid: Missing Required Field

```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_abc",
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "title": "Hello",
      "type": "note",
      "parent": null,
      "children": []
      // ❌ Missing "created" and "modified"
    }
  }
}
```

**Validation error**:
```json
[
  {
    "instancePath": "/nodes/node_abc",
    "schemaPath": "#/$defs/node/required",
    "keyword": "required",
    "params": { "missingProperty": "created" },
    "message": "must have required property 'created'"
  }
]
```

### Invalid: Wrong ID Format

```json
{
  "nodes": {
    "invalid-id": {  // ❌ Wrong format
      "id": "invalid-id",
      "title": "Test",
      "type": "note",
      "parent": null,
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  },
  "rootNodes": ["invalid-id"]
}
```

**Validation error**:
```json
[
  {
    "instancePath": "/nodes",
    "schemaPath": "#/$defs/globalExport/properties/nodes/patternProperties",
    "keyword": "patternProperties",
    "message": "must match pattern \"^(node|symlink)_\\d+_[a-z0-9]+$\""
  }
]
```

### Invalid: Symlink Without targetId

```json
{
  "nodes": {
    "symlink_123_abc": {
      "id": "symlink_123_abc",
      "title": "Link",
      "type": "symlink",  // ❌ Symlink without targetId
      "parent": null,
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  }
}
```

**Validation error**:
```json
[
  {
    "instancePath": "/nodes/symlink_123_abc",
    "schemaPath": "#/$defs/node/allOf/0/then/required",
    "keyword": "required",
    "params": { "missingProperty": "targetId" },
    "message": "must have required property 'targetId'"
  }
]
```

---

## Language-Specific Examples

### JavaScript (Detailed)

**Full validation with error handling**:

```javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

async function validateDeepMemoData(data) {
  // Load schema
  const schemaUrl = 'https://deepmemo.org/schemas/v1.0/deepmemo.json';
  const schema = await fetch(schemaUrl).then(r => r.json());

  // Configure AJV
  const ajv = new Ajv({
    allErrors: true,      // Report all errors (not just first)
    verbose: true,        // Include schema and data in errors
    strict: false         // Allow additional properties
  });
  addFormats(ajv);       // Add format validators

  // Compile schema
  const validate = ajv.compile(schema);

  // Validate data
  const valid = validate(data);

  if (!valid) {
    // Format errors for display
    const errors = validate.errors.map(err => ({
      path: err.instancePath,
      message: err.message,
      value: err.data,
      schema: err.schemaPath
    }));

    throw new Error(
      `Validation failed:\n${JSON.stringify(errors, null, 2)}`
    );
  }

  return true;
}

// Usage
try {
  await validateDeepMemoData(importedData);
  console.log('✓ Data is valid, safe to import');
} catch (error) {
  console.error('✗ Validation failed:', error.message);
}
```

### Python

**Using jsonschema library**:

```python
import json
from jsonschema import validate, ValidationError

# Load schema
with open('schemas/v1.0/deepmemo.json', 'r') as f:
    schema = json.load(f)

# Load data
with open('export.json', 'r') as f:
    data = json.load(f)

# Validate
try:
    validate(instance=data, schema=schema)
    print('✓ Data is valid')
except ValidationError as e:
    print(f'✗ Validation failed: {e.message}')
    print(f'  Path: {list(e.path)}')
```

### Go

**Using gojsonschema**:

```go
package main

import (
    "fmt"
    "github.com/xeipuuv/gojsonschema"
)

func main() {
    // Load schema
    schemaLoader := gojsonschema.NewReferenceLoader(
        "file://./schemas/v1.0/deepmemo.json",
    )

    // Load data
    dataLoader := gojsonschema.NewReferenceLoader(
        "file://./export.json",
    )

    // Validate
    result, err := gojsonschema.Validate(schemaLoader, dataLoader)
    if err != nil {
        panic(err.Error())
    }

    if result.Valid() {
        fmt.Println("✓ Data is valid")
    } else {
        fmt.Println("✗ Validation failed:")
        for _, err := range result.Errors() {
            fmt.Printf("  - %s: %s\n", err.Field(), err.Description())
        }
    }
}
```

### Rust

**Using jsonschema crate**:

```rust
use jsonschema::JSONSchema;
use serde_json;
use std::fs;

fn main() {
    // Load schema
    let schema_text = fs::read_to_string("schemas/v1.0/deepmemo.json")
        .expect("Failed to read schema");
    let schema_json: serde_json::Value = serde_json::from_str(&schema_text)
        .expect("Failed to parse schema");
    let schema = JSONSchema::compile(&schema_json)
        .expect("Failed to compile schema");

    // Load data
    let data_text = fs::read_to_string("export.json")
        .expect("Failed to read data");
    let data: serde_json::Value = serde_json::from_str(&data_text)
        .expect("Failed to parse data");

    // Validate
    match schema.validate(&data) {
        Ok(_) => println!("✓ Data is valid"),
        Err(errors) => {
            println!("✗ Validation failed:");
            for error in errors {
                println!("  - {}", error);
            }
        }
    }
}
```

---

## Integrating Validation in DeepMemo

### Frontend Import Validation

**In `data.js` (import function)**:

```javascript
import Ajv from 'ajv';

let schemaValidator = null;

async function loadSchema() {
  if (!schemaValidator) {
    const schema = await fetch('schemas/v1.0/deepmemo.json')
      .then(r => r.json());
    const ajv = new Ajv({ allErrors: true });
    schemaValidator = ajv.compile(schema);
  }
  return schemaValidator;
}

export async function importData(jsonData) {
  // 1. Validate structure
  const validate = await loadSchema();
  const valid = validate(jsonData);

  if (!valid) {
    const errors = validate.errors
      .map(e => `${e.instancePath}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Invalid data format:\n${errors}\n\n` +
      `Please ensure the data follows the DeepMemo format specification.`
    );
  }

  // 2. Additional semantic validation
  validateRelationships(jsonData);

  // 3. Proceed with import
  // ...
}

function validateRelationships(data) {
  // Check bidirectional parent-child consistency
  const nodes = data.nodes || {};

  for (const [nodeId, node] of Object.entries(nodes)) {
    // Check parent consistency
    if (node.parent) {
      const parent = nodes[node.parent];
      if (!parent) {
        throw new Error(`Node ${nodeId} has non-existent parent ${node.parent}`);
      }
      if (!parent.children.includes(nodeId)) {
        throw new Error(
          `Parent ${node.parent} doesn't list ${nodeId} as child`
        );
      }
    }

    // Check children consistency
    for (const childId of node.children) {
      const child = nodes[childId];
      if (!child) {
        throw new Error(`Node ${nodeId} has non-existent child ${childId}`);
      }
      if (child.parent !== nodeId) {
        throw new Error(
          `Child ${childId} doesn't have ${nodeId} as parent`
        );
      }
    }

    // Check symlink targets
    if (node.type === 'symlink') {
      if (!node.targetId) {
        throw new Error(`Symlink ${nodeId} missing targetId`);
      }
      if (!nodes[node.targetId]) {
        throw new Error(
          `Symlink ${nodeId} points to non-existent node ${node.targetId}`
        );
      }
    }
  }
}
```

### CLI Tool Validation

**For `bin/branch2pdf.js` and similar tools**:

```javascript
#!/usr/bin/env node

import Ajv from 'ajv';
import fs from 'fs';

async function main() {
  const [,, inputFile, outputFile] = process.argv;

  if (!inputFile || !outputFile) {
    console.error('Usage: branch2pdf <input.json> <output.pdf>');
    process.exit(1);
  }

  // Load and validate data
  const dataText = fs.readFileSync(inputFile, 'utf-8');
  const data = JSON.parse(dataText);

  // Validate against schema
  const schemaText = fs.readFileSync(
    'schemas/v1.0/deepmemo.json',
    'utf-8'
  );
  const schema = JSON.parse(schemaText);

  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  if (!validate(data)) {
    console.error('❌ Invalid data format:');
    for (const error of validate.errors) {
      console.error(`  ${error.instancePath}: ${error.message}`);
    }
    process.exit(1);
  }

  console.log('✓ Data validated successfully');

  // Generate PDF
  await generatePDF(data, outputFile);
}

main().catch(console.error);
```

---

## Testing LLM-Generated Content

### Workflow

1. **Prompt LLM** to generate DeepMemo JSON
2. **Save output** to file (e.g., `llm-output.json`)
3. **Validate** against schema
4. **Import** if valid

### Validation Script

**`validate-llm.sh`**:

```bash
#!/bin/bash

INPUT=$1

if [ -z "$INPUT" ]; then
  echo "Usage: ./validate-llm.sh <llm-output.json>"
  exit 1
fi

echo "Validating LLM-generated content..."

# Validate with ajv-cli
ajv validate \
  -s schemas/v1.0/deepmemo.json \
  -d "$INPUT"

if [ $? -eq 0 ]; then
  echo "✓ Validation successful!"
  echo "You can import $INPUT into DeepMemo."
else
  echo "✗ Validation failed."
  echo "Please check the errors above and regenerate."
  exit 1
fi
```

**Usage**:
```bash
chmod +x validate-llm.sh
./validate-llm.sh chatgpt-export.json
```

---

## Common Validation Errors

### 1. Missing Required Field

**Error**:
```
must have required property 'created'
```

**Fix**: Add all required fields:
```json
{
  "id": "node_123_abc",
  "title": "...",
  "type": "note",
  "parent": null,
  "children": [],
  "created": 1737115200000,    // ✓ Added
  "modified": 1737115200000    // ✓ Added
}
```

### 2. Invalid ID Format

**Error**:
```
must match pattern "^(node|symlink)_\d+_[a-z0-9]+$"
```

**Fix**: Use correct ID format:
```json
// ❌ Wrong
"id": "node-123"
"id": "123abc"
"id": "node_ABC"

// ✅ Correct
"id": "node_1737115200000_abc"
"id": "symlink_1737115200000_xyz"
```

### 3. Symlink Missing targetId

**Error**:
```
must have required property 'targetId'
```

**Fix**: Add targetId for symlinks:
```json
{
  "type": "symlink",
  "targetId": "node_123_abc"  // ✓ Required for symlinks
}
```

### 4. Attachments as Strings

**Error**:
```
must be object
```

**Fix**: Use object format:
```json
// ❌ Wrong
"attachments": ["attach_123_abc"]

// ✅ Correct
"attachments": [
  {
    "id": "attach_123_abc",
    "name": "file.pdf",
    "type": "application/pdf",
    "size": 1234567
  }
]
```

### 5. Branch Missing type Field

**Error**:
```
must have required property 'type'
```

**Fix**: Add type field for branches:
```json
{
  "type": "deepmemo-branch",  // ✓ Required
  "version": "1.0",
  "branchRootId": "node_123_abc",
  // ...
}
```

---

## Online Validation

### JSON Schema Validator

Use online tools for quick validation:

**URL**: https://www.jsonschemavalidator.net/

**Steps**:
1. Paste schema from `schemas/v1.0/deepmemo.json`
2. Paste your data
3. Click "Validate"
4. Fix any errors shown

### VS Code Extension

**Install**: [JSON Schema Validator](https://marketplace.visualstudio.com/items?itemName=tberman.json-schema-validator)

**Configure** (in `export.json`):
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  // ... rest of data
}
```

**Result**: Live validation as you type, with autocomplete!

---

## CI/CD Integration

### GitHub Actions

**`.github/workflows/validate-exports.yml`**:

```yaml
name: Validate Exports

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install ajv-cli
        run: npm install -g ajv-cli

      - name: Validate test exports
        run: |
          for file in tests/exports/*.json; do
            echo "Validating $file..."
            ajv validate \
              -s schemas/v1.0/deepmemo.json \
              -d "$file"
          done
```

### Pre-commit Hook

**`.git/hooks/pre-commit`**:

```bash
#!/bin/bash

echo "Validating DeepMemo exports..."

for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.json$'); do
  if [[ $file == *"export"* ]] || [[ $file == *"branch"* ]]; then
    echo "  Validating $file..."
    ajv validate -s schemas/v1.0/deepmemo.json -d "$file"
    if [ $? -ne 0 ]; then
      echo "❌ Validation failed for $file"
      exit 1
    fi
  fi
done

echo "✓ All exports valid"
```

---

## See Also

- [FILE-FORMATS.md](../FILE-FORMATS.md) - Complete format documentation
- [JSON-STRUCTURE.md](JSON-STRUCTURE.md) - Data structure reference
- [schemas/v1.0/deepmemo.json](../schemas/v1.0/deepmemo.json) - Data schema
- [schemas/v1.0/metadata.json](../schemas/v1.0/metadata.json) - Metadata schema
- [JSON Schema Specification](https://json-schema.org/)
- [AJV Documentation](https://ajv.js.org/)
