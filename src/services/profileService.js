const Profile = require('../models/Profile');
const { getGenderData } = require('./genderizeService');
const { getAgeData } = require('./agifyService');
const { getNationalityData } = require('./nationalizeService');
const { getCountryName } = require('./countryService');
const { getAgeGroup } = require('../utils/ageGroupHelper');

const createProfile = async (name) => {
    const normalizedName = name.trim().toLowerCase();

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ name: normalizedName });
    if (existingProfile) {
        return {
            exists: true,
            profile: existingProfile
        };
    }

    try {
        // Call all three APIs in parallel
        const [genderData, ageData, nationalityData] = await Promise.all([
            getGenderData(normalizedName),
            getAgeData(normalizedName),
            getNationalityData(normalizedName)
        ]);

        // Calculate age group
        const age_group = getAgeGroup(ageData.age);

        // Get country name
        const country_name = getCountryName(nationalityData.country_id);

        // Create new profile
        const profile = await Profile.create({
            name: normalizedName,
            gender: genderData.gender,
            gender_probability: genderData.gender_probability,
            age: ageData.age,
            age_group,
            country_id: nationalityData.country_id,
            country_name,
            country_probability: nationalityData.country_probability
        });

        return {
            exists: false,
            profile
        };
    } catch (error) {
        if (error.apiName) {
            throw error;
        }
        throw new Error('Failed to create profile');
    }
};

const getProfileById = async (id) => {
    const profile = await Profile.findById(id);
    return profile;
};

const getAllProfiles = async (filters = {}, options = {}) => {
    const query = {};

    // Basic filters
    if (filters.gender) {
        query.gender = filters.gender.toLowerCase();
    }

    if (filters.age_group) {
        query.age_group = filters.age_group.toLowerCase();
    }

    if (filters.country_id) {
        query.country_id = filters.country_id.toUpperCase();
    }

    // Age range filters
    if (filters.min_age !== undefined || filters.max_age !== undefined) {
        query.age = {};
        if (filters.min_age !== undefined) {
            query.age.$gte = parseInt(filters.min_age);
        }
        if (filters.max_age !== undefined) {
            query.age.$lte = parseInt(filters.max_age);
        }
    }

    // Probability filters
    if (filters.min_gender_probability !== undefined) {
        query.gender_probability = { $gte: parseFloat(filters.min_gender_probability) };
    }

    if (filters.min_country_probability !== undefined) {
        query.country_probability = { $gte: parseFloat(filters.min_country_probability) };
    }

    // Build sort object
    const sortOptions = {};
    const sortBy = options.sort_by || 'created_at';
    const order = options.order === 'asc' ? 1 : -1;

    const validSortFields = ['age', 'created_at', 'gender_probability'];
    if (validSortFields.includes(sortBy)) {
        sortOptions[sortBy] = order;
    }

    // Pagination
    const page = parseInt(options.page) || 1;
    const limit = Math.min(parseInt(options.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [profiles, total] = await Promise.all([
        Profile.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        Profile.countDocuments(query)
    ]);

    // Transform _id to id
    const transformedProfiles = profiles.map(profile => {
        const { _id, __v, ...rest } = profile;
        return {
            id: _id,
            ...rest
        };
    });

    return {
        profiles: transformedProfiles,
        total,
        page,
        limit
    };
};

const deleteProfile = async (id) => {
    const result = await Profile.findByIdAndDelete(id);
    return result;
};

module.exports = {
    createProfile,
    getProfileById,
    getAllProfiles,
    deleteProfile
};