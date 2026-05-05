const fs = require('fs');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Profile = require('../models/Profile');
const { getAgeGroup } = require('../utils/ageGroup');
const { validateNameParam } = require('../utils/validators');
const cacheService = require('../services/cacheService');

const VALID_GENDERS = ['male', 'female'];

const uploadCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'CSV file required' });
    }

    const results = {
        total_rows: 0,
        inserted: 0,
        skipped: 0,
        reasons: {
            duplicate_name: 0,
            invalid_age: 0,
            invalid_gender: 0,
            missing_fields: 0,
            malformed_row: 0
        }
    };

    const batch = [];
    const BATCH_SIZE = 1000;

    const processBatch = async () => {
        if (batch.length === 0) return;

        const toInsert = [];
        for (const row of batch) {
            const exists = await Profile.findOne({ name: row.name });
            if (!exists) {
                toInsert.push(row);
            } else {
                results.skipped++;
                results.reasons.duplicate_name++;
            }
        }

        if (toInsert.length > 0) {
            try {
                await Profile.insertMany(toInsert, { ordered: false });
                results.inserted += toInsert.length;
            } catch (err) {
                if (err.writeErrors) {
                    results.inserted += (toInsert.length - err.writeErrors.length);
                    results.skipped += err.writeErrors.length;
                }
            }
        }

        batch.length = 0;
    };

    return new Promise((resolve) => {
        const stream = Readable.from(req.file.buffer.toString());

        stream
            .pipe(csv())
            .on('data', async (row) => {
                results.total_rows++;

                // Validate required fields
                if (!row.name || !row.gender || !row.age || !row.country_id || !row.country_name) {
                    results.skipped++;
                    results.reasons.missing_fields++;
                    return;
                }

                // Validate gender
                if (!VALID_GENDERS.includes(row.gender.toLowerCase())) {
                    results.skipped++;
                    results.reasons.invalid_gender++;
                    return;
                }

                // Validate age
                const age = parseInt(row.age);
                if (isNaN(age) || age < 0 || age > 150) {
                    results.skipped++;
                    results.reasons.invalid_age++;
                    return;
                }

                const profile = {
                    name: row.name.toLowerCase().trim(),
                    gender: row.gender.toLowerCase(),
                    gender_probability: parseFloat(row.gender_probability) || 0.5,
                    age: age,
                    age_group: getAgeGroup(age),
                    country_id: row.country_id.toUpperCase(),
                    country_name: row.country_name,
                    country_probability: parseFloat(row.country_probability) || 0.5,
                    created_at: new Date()
                };

                batch.push(profile);

                if (batch.length >= BATCH_SIZE) {
                    stream.pause();
                    await processBatch();
                    stream.resume();
                }
            })
            .on('end', async () => {
                await processBatch();
                cacheService.invalidate();

                res.json({
                    status: 'success',
                    total_rows: results.total_rows,
                    inserted: results.inserted,
                    skipped: results.skipped,
                    reasons: results.reasons
                });

                resolve();
            })
            .on('error', (err) => {
                res.status(500).json({
                    status: 'error',
                    message: 'CSV processing failed'
                });
                resolve();
            });
    });
};

module.exports = { uploadCSV };