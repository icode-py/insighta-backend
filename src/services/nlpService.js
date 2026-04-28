const { getAllCountries } = require('./countryService');

class NaturalLanguageParser {
    constructor() {
        this.ageGroups = {
            'child': { min: 0, max: 12 },
            'teenager': { min: 13, max: 19 },
            'adult': { min: 20, max: 59 },
            'senior': { min: 60, max: 150 }
        };

        this.specialMappings = {
            'young': { min_age: 16, max_age: 24 }
        };

        this.genderKeywords = {
            'male': 'male',
            'males': 'male',
            'man': 'male',
            'men': 'male',
            'boy': 'male',
            'boys': 'male',
            'female': 'female',
            'females': 'female',
            'woman': 'female',
            'women': 'female',
            'girl': 'female',
            'girls': 'female'
        };

        this.countries = getAllCountries();
        this.countryAliases = {
            'usa': 'US',
            'america': 'US',
            'uk': 'GB',
            'britain': 'GB',
            'england': 'GB',
            'uae': 'AE',
            'emirates': 'AE',
            'nigeria': 'NG'
        };
    }

    parseQuery(queryString) {
        if (!queryString || typeof queryString !== 'string') {
            return null;
        }

        const query = queryString.toLowerCase().trim();
        const filters = {};
        let foundMatch = false;

        // Parse "above X" patterns FIRST
        if (this.parseAbovePattern(query, filters)) foundMatch = true;

        // Parse "below/under X" patterns
        if (this.parseBelowPattern(query, filters)) foundMatch = true;

        // Parse age-related terms (young only)
        if (this.parseAgeTerms(query, filters)) foundMatch = true;

        // Parse gender
        if (this.parseGender(query, filters)) foundMatch = true;

        // Parse age groups
        if (this.parseAgeGroups(query, filters)) foundMatch = true;

        // Parse countries
        if (this.parseCountries(query, filters)) foundMatch = true;

        // Handle combined gender queries
        if (query.includes('male and female') || query.includes('female and male')) {
            delete filters.gender;
            foundMatch = true;
        }

        if (!foundMatch) {
            return null;
        }

        return filters;
    }

    parseAgeTerms(query, filters) {
        let found = false;

        // Only handle "young" - do NOT parse exact ages
        if (/\byoung\b/.test(query)) {
            filters.min_age = 16;
            filters.max_age = 24;
            found = true;
        }

        return found;
    }

    parseGender(query, filters) {
        if (query.includes('male and female') || query.includes('female and male')) {
            return true;
        }

        // Check female words first (they contain "male" substring)
        const femaleWords = ['female', 'females', 'woman', 'women', 'girl', 'girls'];
        for (const keyword of femaleWords) {
            if (query.includes(keyword)) {
                filters.gender = 'female';
                return true;
            }
        }

        // Check male words
        const maleWords = ['male', 'males', 'man', 'men', 'boy', 'boys'];
        for (const keyword of maleWords) {
            if (query.includes(keyword)) {
                filters.gender = 'male';
                return true;
            }
        }

        return false;
    }

    parseAgeGroups(query, filters) {
        for (const [group, range] of Object.entries(this.ageGroups)) {
            if (query.includes(group)) {
                filters.age_group = group;
                if (!filters.min_age && !filters.max_age && !filters.age) {
                    filters.min_age = range.min;
                    filters.max_age = range.max;
                }
                return true;
            }
        }
        return false;
    }

    parseCountries(query, filters) {
        // Check "people from X" pattern first
        const peoplePattern = /people\s+from\s+([a-z\s]+?)(?:\s|$)/;
        const peopleMatch = query.match(peoplePattern);
        if (peopleMatch) {
            const countryName = peopleMatch[1].trim();
            for (const [code, name] of Object.entries(this.countries)) {
                if (name.toLowerCase() === countryName) {
                    filters.country_id = code;
                    return true;
                }
            }
            for (const [alias, code] of Object.entries(this.countryAliases)) {
                if (countryName === alias) {
                    filters.country_id = code;
                    return true;
                }
            }
        }

        // Check country aliases
        for (const [alias, code] of Object.entries(this.countryAliases)) {
            if (query.includes(alias)) {
                filters.country_id = code;
                return true;
            }
        }

        // Check full country names
        for (const [code, name] of Object.entries(this.countries)) {
            if (query.includes(name.toLowerCase())) {
                filters.country_id = code;
                return true;
            }
        }

        // Check for "from X" pattern
        const fromPattern = /from\s+([a-z\s]+?)(?:\s|$)/;
        const fromMatch = query.match(fromPattern);
        if (fromMatch) {
            const countryName = fromMatch[1].trim();
            for (const [code, name] of Object.entries(this.countries)) {
                if (name.toLowerCase() === countryName) {
                    filters.country_id = code;
                    return true;
                }
            }
            for (const [alias, code] of Object.entries(this.countryAliases)) {
                if (countryName === alias) {
                    filters.country_id = code;
                    return true;
                }
            }
        }

        return false;
    }

    parseAbovePattern(query, filters) {
        // look for "above X", "over X", "older than X"
        if (query.includes('above')) {
            const match = query.match(/above\s+(\d+)/);
            if (match) {
                filters.min_age = parseInt(match[1]);
                return true;
            }
        }
        if (query.includes('over')) {
            const match = query.match(/over\s+(\d+)/);
            if (match) {
                filters.min_age = parseInt(match[1]);
                return true;
            }
        }
        if (query.includes('older than')) {
            const match = query.match(/older\s+than\s+(\d+)/);
            if (match) {
                filters.min_age = parseInt(match[1]);
                return true;
            }
        }
        return false;
    }

    parseBelowPattern(query, filters) {
        if (query.includes('below')) {
            const match = query.match(/below\s+(\d+)/);
            if (match) {
                filters.max_age = parseInt(match[1]);
                return true;
            }
        }
        if (query.includes('under')) {
            const match = query.match(/under\s+(\d+)/);
            if (match) {
                filters.max_age = parseInt(match[1]);
                return true;
            }
        }
        if (query.includes('younger than')) {
            const match = query.match(/younger\s+than\s+(\d+)/);
            if (match) {
                filters.max_age = parseInt(match[1]);
                return true;
            }
        }
        return false;
    }

}

module.exports = new NaturalLanguageParser();