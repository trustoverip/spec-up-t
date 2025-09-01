/**
 * Creates an HTML list of external specifications based on the provided configuration.
 *
 * @param {object} config - The configuration object containing specification details.
 * @param {Array<object>} config.specs - An array of specification objects.
 * @param {Array<object>} config.specs[].external_specs - An array of external specification objects.
 * @param {string} config.specs[].external_specs[].external_spec - The name of the external specification.
 * @param {string} config.specs[].external_specs[].url - The URL of the external specification.
 * @param {string} config.specs[].external_specs[].gh_page - The GitHub page of the external specification.
 *
 * @returns {string} An HTML string representing the list of external specifications.
 *         Returns a message indicating no specifications were found if the configuration is invalid or empty.
 */

const Logger = require('./utils/logger');

module.exports = function createExternalSpecsList(config) {
    if (!config?.specs?.length || !Array.isArray(config.specs)) {
        Logger.warn('Invalid config format. Expected an object with a specs array.');
        return '<p>No external specifications found.</p>';
    }

    let externalSpecs = [];
    config.specs.forEach(spec => {
        if (spec.external_specs && Array.isArray(spec.external_specs)) {
            externalSpecs = externalSpecs.concat(spec.external_specs);
        }
    });

    if (externalSpecs.length === 0) {
        return '<p>No external specifications found.</p>';
    }

    let html = '<table class="table table-striped">';
    html += '<thead><tr><th>Specification</th><th>GitHub Page</th></tr></thead>';
    html += '<tbody>';

    externalSpecs.forEach(spec => {
        html += `
      <tr>
        <td><a href="${spec.url}" target="_blank">${spec.external_spec}</a></td>
        <td><a href="${spec.gh_page}" target="_blank"><i class="fa fa-github"></i> GitHub Page</a></td>
      </tr>
    `;
    });

    html += '</tbody></table>';
    return html;
};