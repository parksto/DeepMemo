# DeepMemo Tests

## Available Test Suites

### Validation Tests
📂 `validation/` - JSON Schema validation tests

**Run tests:**
```
http://localhost:8000/tests/validation/test-validation.html
```

See [validation/README.md](validation/README.md) for details.

---

## Running Tests

### Start Server
```bash
cd /mnt/c/Users/parks/Documents/Dev/deepMemo/DeepMemo-refonte-doc
python -m http.server 8000
```

### Open Tests
- Validation: http://localhost:8000/tests/validation/test-validation.html

---

**Note:** Make sure to disable service worker cache during testing (DevTools → Application → Service Workers → Bypass for network)
