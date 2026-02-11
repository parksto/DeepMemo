# Changelog

All notable changes to DeepMemo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.11.0] - 2026-02-15

### Added
- **JSON Schema Validation** - Complete schema validation for imports/exports
  - `schemas/v1.0/deepmemo.json` - Full archive validation schema
  - `schemas/v1.0/metadata.json` - Metadata validation schema
  - Import validation with error reporting and legacy format support
  - Tests added in `tests/validation/`

### Changed
- **Documentation Structure** - Complete reorganization and cleanup
  - Removed 23 legacy/duplicate documentation files
  - Consolidated structure: main docs (1-CONCEPTS to 4-FEATURES), guides/, reference/, development/
  - Updated all internal links to point to new locations
  - Francized all documentation with consistent terminology
- **Vocabulary Harmonization** - Standardized terminology throughout codebase
  - "share" → "url" (reflects actual usage for bookmarks/multi-tab)
  - "tree" → "arborescence" (French localization)
  - Updated UI strings and documentation

### Fixed
- **Symlink ID Generation Consistency** - Standardized symlink ID generation to always use `symlink_` prefix instead of inconsistent `node_` prefix
  - **Impact**: All new symlinks will have IDs matching pattern `symlink_{timestamp}_{random}`
  - **Code**: Fixed `src/js/features/modals.js:358` to use `symlink_` prefix
  - **Schema**: Updated `schemas/v1.0/deepmemo.json` with strict validation rules enforcing type/ID correspondence
  - **Migration**: Existing symlinks with `node_` prefix will continue to work (backward compatible), but are technically invalid per schema v1.0
- **ID Pattern Validation** - Corrected documentation to match actual ID generation patterns
- **Metadata Format** - Updated `validateMetadata()` to correspond to current v1.0 format
- **Code References** - Fixed 100+ broken or outdated code references in documentation

### Documentation
- Complete fact-check of all documentation against source code
- All code references verified and updated (`file:line` format)
- Removed duplicate and obsolete documentation files
- Added comprehensive examples and test cases

---

## [0.10.5] - 2026-01-31

### Added
- **Comprehensive Documentation** - Complete technical documentation restructure
  - `docs/1-CONCEPTS.md` - Core concepts (nodes, hierarchy, symlinks, instance keys, branch mode)
  - `docs/2-ARCHITECTURE.md` - Technical architecture and module design
  - `docs/3-DATA-MODEL.md` - Data structures and IndexedDB schema
  - `docs/4-FEATURES.md` - Complete feature reference (3400+ lines, 99.7% accuracy)
  - `docs/reference/file-formats/DM-FORMAT.md` - Complete .dm archive format specification
  - `docs/reference/url-routing.md` - URL routing system reference
  - Multiple thematic guides (FILE-FORMATS, FS-SYNC, PDF-EXPORT, ATTACHMENTS, I18N, PWA)

### Changed
- **Documentation Structure** - Reorganized docs into narrative structure (concepts → architecture → features → reference)
- **Code References** - All documentation now includes exact code references (`file:line` format)

### Documentation
- Fact-checked all major documentation files against source code
- Fixed 150+ reference errors across documentation
- Standardized documentation style following "cognitive clarity" principle

---

## [0.10.4] - 2026-01-28

### Added
- Version synchronization across codebase
- Initial documentation framework

---

## Archive Format Versions

### Schema v1.0
- **Format**: `.dm` archive (ZIP container)
- **Files**: `metadata.json`, `data.json`, `attachments/`
- **Validation**: JSON Schema validation with strict type/ID correspondence
- **Breaking**: Symlink IDs must start with `symlink_` (enforced in schema, backward compatible in code)

---

## Migration Guides

### From Pre-0.10.5 (Symlink ID Format)

**Issue**: Older versions may have created symlinks with `node_` prefix instead of `symlink_` prefix.

**Impact**:
- ✅ Application continues to work normally (backward compatible)
- ⚠️ Schema validation may fail for old symlinks
- ✅ New symlinks use correct `symlink_` prefix

**Action Required**: None - automatic forward compatibility

**Optional**: To update old symlinks to new format:
1. Export data as `.dm` archive
2. Extract and edit `data.json`
3. Find all nodes with `"type": "symlink"` and ID starting with `node_`
4. Replace `"id": "node_xxx"` with `"id": "symlink_xxx"`
5. Update all references to these IDs in `parent`, `children`, `targetId` fields
6. Re-import the archive

---

## Version Numbering

DeepMemo follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version: Incompatible API/data format changes
- **MINOR** version: Backward-compatible functionality additions
- **PATCH** version: Backward-compatible bug fixes

**Current Version**: 0.11.0 (pre-1.0 development)

---

## Links

- [Project Repository](https://github.com/parksto/DeepMemo)
- [Documentation](https://deepmemo.org/docs)
- [Website](https://deepmemo.org/)
- [Report Issues](https://github.com/parksto/DeepMemo/issues)

---

**Last Updated**: 2026-02-15
