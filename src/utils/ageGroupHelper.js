const getAgeGroup = (age) => {
    if (age >= 0 && age <= 12) return 'child';
    if (age >= 13 && age <= 19) return 'teenager';
    if (age >= 20 && age <= 59) return 'adult';
    if (age >= 60) return 'senior';
    return null;
};

const getAgeRange = (ageGroup) => {
    const ranges = {
        'child': { min: 0, max: 12 },
        'teenager': { min: 13, max: 19 },
        'adult': { min: 20, max: 59 },
        'senior': { min: 60, max: 150 }
    };
    return ranges[ageGroup] || null;
};

module.exports = { getAgeGroup, getAgeRange };