/**
 * Replaces project-specific placeholders in a string.
 * @param {string} text 
 * @param {object} project 
 * @returns {string}
 */
export const replaceProjectPlaceholders = (text, project) => {
    if (!text || !project) return text;
    let result = text;
    const features = typeof project.features === 'string'
        ? project.features.split(',').map(f => f.trim())
        : (Array.isArray(project.features) ? project.features : []);

    const replacements = {
        '{{projectName}}': project.name || '',
        '{{industry}}': project.industry || '',
        '{{targetAudience}}': project.targetAudience || '',
        '{{mainBenefit}}': project.description || '',
        '{{keyFeature1}}': features[0] || 'core efficiency',
        '{{keyFeature2}}': features[1] || 'seamless workflow',
        '{{website}}': project.website || 'our platform'
    };

    Object.keys(replacements).forEach(key => {
        result = result.split(key).join(replacements[key]);
    });
    return result;
};
