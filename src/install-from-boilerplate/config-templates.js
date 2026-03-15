/**
 * Configuration for available content templates.
 *
 * Each template provides a different structure for specification markdown files.
 * The assets/ and static/ directories remain the same across all templates
 * and are always sourced from the original boilerplate.
 *
 * - id: unique identifier used in env var SPEC_UP_T_TEMPLATE and GitHubUi
 * - name: human-readable name shown during selection
 * - description: brief explanation of the template structure
 * - directory: folder name inside boilerplate-templates/, or null for default
 */


/**
 * IMPORTANT: When adding new templates, also update the template selection logic in the GitHubUi file `CreateSpecUpProject.vue`.
 */
const templates = [
    {
        id: 'default',
        name: 'Default (Starter Pack)',
        description: 'Standard boilerplate with head, body, and example markup files',
        directory: null
    },
    {
        id: 'boilerplate-template-01',
        name: 'Trust over IP Specification (Intro, Body, Coda)',
        description: 'Structured with introduction, body, and concluding sections',
        directory: 'boilerplate-template-01'
    },
    {
        id: 'boilerplate-template-02',
        name: 'Multi-Part Specification (Part 1, 2, 3)',
        description: 'Organized in sequential parts for longer specifications',
        directory: 'boilerplate-template-02'
    }
];

module.exports = { templates };
