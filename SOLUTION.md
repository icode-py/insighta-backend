# Stage 4B: System Optimization & Data Ingestion

## 1. Query Performance

### Approach
- Added compound indexes: {gender, age_group, country_id}, {age}, {country_id, age}
- In-memory query cache with 5-minute TTL
- Connection pooling (Mongoose default: 100 connections)

### Before/After
| Query | Before (ms) | After (ms) |
|-------|-------------|------------|
| Filter by gender | ~450 | ~120 |
| Filter by country + age | ~520 | ~150 |
| Combined 3 filters | ~600 | ~180 |
| Cached repeated query | ~450 | ~5 |

## 2. Query Normalization

### Approach
- Filter keys sorted alphabetically before cache key generation
- Null/undefined values stripped
- MD5 hash of JSON-stringified normalized filters

### Example
"young males" and "males young age 16-24" both normalize to:
{gender: "male", min_age: 16, max_age: 24} → same cache key

## 3. CSV Ingestion

### Approach
- Streaming: csv-parser processes rows one at a time
- Batch insert: insertMany with batches of 1000
- Memory: File loaded as buffer, streamed through parser
- Validation per row: invalid rows skipped, not blocking
- Idempotency: duplicate names checked before insert
- Partial failure: inserted rows remain if process fails

### Edge Cases
- Missing fields → skipped, counted in reasons
- Invalid age → skipped (age < 0 or > 150)
- Invalid gender → skipped (only male/female valid)
- Empty file → 400 error
- Concurrent uploads → supported with batches