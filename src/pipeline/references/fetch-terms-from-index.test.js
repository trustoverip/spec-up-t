'use strict';

const axios = require('axios');
const { fetchAllTermsFromIndex } = require('./fetch-terms-from-index');

jest.mock('axios');
jest.mock('../../utils/logger', () => ({
    process: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));
const Logger = require('../../utils/logger');

const MINIMAL_INDEX_HTML = `
<html><body>
  <dl class="terms-and-definitions-list">
    <dt class="term-local">
      <span id="term:example-term"></span>
      <span class="term-local-original-term">example-term</span>
    </dt>
    <dd><p>An example definition.</p></dd>
  </dl>
</body></html>`;

const OWNER = 'test-owner';
const REPO  = 'test-repo';
const GH_PAGE_URL = 'https://test-owner.github.io/test-repo/';

describe('fetchAllTermsFromIndex — authentication error handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('succeeds with valid token: fetches commit hash then index.html', async () => {
        axios.get
            .mockResolvedValueOnce({ status: 200, data: { commit: { sha: 'abc123' } } })
            .mockResolvedValueOnce({ status: 200, data: MINIMAL_INDEX_HTML });

        const result = await fetchAllTermsFromIndex('valid-token', OWNER, REPO, { ghPageUrl: GH_PAGE_URL });

        expect(result).not.toBeNull();
        expect(result.sha).toBe('abc123');
        expect(result.terms.length).toBe(1);
        expect(result.terms[0].term).toBe('example-term');
    });

    test('on 401 from branch fetch: warns, retries without auth, and returns commit hash', async () => {
        const authError = Object.assign(new Error('Request failed with status 401'), {
            response: { status: 401 }
        });

        axios.get
            .mockRejectedValueOnce(authError)
            .mockResolvedValueOnce({ status: 200, data: { commit: { sha: 'def456' } } })
            .mockResolvedValueOnce({ status: 200, data: MINIMAL_INDEX_HTML });

        const result = await fetchAllTermsFromIndex('bad-token', OWNER, REPO, { ghPageUrl: GH_PAGE_URL });

        expect(Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('GITHUB_API_TOKEN is invalid or expired')
        );
        expect(result).not.toBeNull();
        expect(result.sha).toBe('def456');
        expect(result.terms.length).toBe(1);
    });

    test('on 401 then retry also fails: warns and continues with null commit hash', async () => {
        const authError = Object.assign(new Error('Request failed with status 401'), {
            response: { status: 401 }
        });
        const networkError = new Error('Network unreachable');

        axios.get
            .mockRejectedValueOnce(authError)
            .mockRejectedValueOnce(networkError)
            .mockResolvedValueOnce({ status: 200, data: MINIMAL_INDEX_HTML });

        const result = await fetchAllTermsFromIndex('bad-token', OWNER, REPO, { ghPageUrl: GH_PAGE_URL });

        expect(Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Could not get commit hash from main branch')
        );
        expect(result).not.toBeNull();
        expect(result.sha).toBeNull();
        expect(result.terms.length).toBe(1);
    });

    test('non-401 branch error: warns without triggering 401 retry path', async () => {
        const serverError = Object.assign(new Error('Request failed with status 500'), {
            response: { status: 500 }
        });

        axios.get
            .mockRejectedValueOnce(serverError)
            .mockResolvedValueOnce({ status: 200, data: MINIMAL_INDEX_HTML });

        const result = await fetchAllTermsFromIndex('valid-token', OWNER, REPO, { ghPageUrl: GH_PAGE_URL });

        expect(Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Could not get commit hash from main branch')
        );
        expect(Logger.warn).not.toHaveBeenCalledWith(
            expect.stringContaining('GITHUB_API_TOKEN is invalid or expired')
        );
        expect(result).not.toBeNull();
    });
});
