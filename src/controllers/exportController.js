const profileService = require('../services/profileService');

const exportProfiles = async (req, res) => {
    try {
        const { format, ...filterParams } = req.query;

        if (format !== 'csv') {
            return res.status(400).json({
                status: 'error',
                message: 'Only CSV format is supported'
            });
        }

        // Build filters from query params
        const filters = {};
        if (filterParams.gender) filters.gender = filterParams.gender;
        if (filterParams.age_group) filters.age_group = filterParams.age_group;
        if (filterParams.country_id) filters.country_id = filterParams.country_id;
        if (filterParams.min_age) filters.min_age = filterParams.min_age;
        if (filterParams.max_age) filters.max_age = filterParams.max_age;

        // Get all matching profiles (no pagination limit for export)
        const result = await profileService.getAllProfiles(filters, {
            limit: 10000,
            page: 1,
            sort_by: filterParams.sort_by,
            order: filterParams.order
        });

        // Generate CSV
        const headers = 'id,name,gender,gender_probability,age,age_group,country_id,country_name,country_probability,created_at\n';

        const rows = result.profiles.map(p =>
            `${p.id},"${p.name}",${p.gender},${p.gender_probability},${p.age},${p.age_group},${p.country_id},"${p.country_name}",${p.country_probability},${p.created_at}`
        ).join('\n');

        const csv = headers + rows;

        // Set response headers for CSV download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="profiles_${timestamp}.csv"`);

        return res.status(200).send(csv);

    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Export failed'
        });
    }
};

module.exports = { exportProfiles };