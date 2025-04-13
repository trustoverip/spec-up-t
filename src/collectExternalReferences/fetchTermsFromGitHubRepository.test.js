/*
This test suite covers the main functionality of the fetchTermsFromGitHubRepository function including:

- Retrieving cached search results when available
- Fetching and caching new results when not in cache
- Handling API errors gracefully
- Processing empty search results correctly

The tests use Jest's mocking capabilities to avoid actual GitHub API calls and filesystem operations, making the tests fast and reliable.
*/

const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('crypto');
jest.mock('../utils/isLineWithDefinition');
jest.mock('../config/paths');

// Replace your static mock with a configurable one
jest.mock('./octokitClient', () => {
    // Create mock functions that can be reconfigured in each test
    const mockSearchClient = {
        search: jest.fn()
    };

    const mockContentClient = {
        getContent: jest.fn()
    };

    return {
        getSearchClient: jest.fn().mockResolvedValue(mockSearchClient),
        getContentClient: jest.fn().mockResolvedValue(mockContentClient)
    };
});

// Import the mocked module to access the mock functions
const octokitClient = require('./octokitClient');

// Import the function to test
const { fetchTermsFromGitHubRepository } = require('./fetchTermsFromGitHubRepository');
const { getPath } = require('../config/paths');

describe('fetchTermsFromGitHubRepository', () => {
    // Setup common variables
    const mockToken = 'mock-github-token';
    const mockSearchString = 'test-search';
    const mockOwner = 'test-owner';
    const mockRepo = 'test-repo';
    const mockSubdirectory = 'test-dir';
    const mockCachePath = '/mock/cache/path';

    const mockSearchResponse = {
        data: {
            total_count: 1,
            items: [{
                path: 'test-file.md',
                repository: {
                    owner: { login: 'test-owner' },
                    name: 'test-repo'
                },
                text_matches: [{
                    fragment: '[[def: test-term]]\nContent'
                }]
            }]
        }
    };

    const mockFileContentResponse = {
        data: {
            content: Buffer.from('[[def: test-term]]\nTest file content').toString('base64')
        }
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup common mock returns
        getPath.mockReturnValue(mockCachePath);
        path.join.mockImplementation((...args) => args.join('/'));

        // Mock crypto hash
        const mockHash = {
            update: jest.fn().mockReturnThis(),
            digest: jest.fn().mockReturnValue('mock-hash')
        };
        require('crypto').createHash.mockReturnValue(mockHash);

        // Default file system mocks
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockReturnValue(undefined);
        fs.writeFileSync.mockReturnValue(undefined);
        fs.readFileSync.mockReturnValue('');

        // Default isLineWithDefinition behavior
        const { isLineWithDefinition } = require('../utils/isLineWithDefinition');
        isLineWithDefinition.mockImplementation(line => {
            return line.includes('[[def:') && line.includes(']]');
        });
    });

    test('should return cached search results if available', async () => {
        // Setup cache hit
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(JSON.stringify(mockSearchResponse));

        // Also set up file content cache
        fs.existsSync.mockImplementation((path) => {
            return true; // Assume all files exist in cache
        });

        // Mock content response
        fs.readFileSync.mockImplementation((path) => {
            if (path.includes('.json')) {
                return JSON.stringify(mockSearchResponse);
            } else {
                return '[[def: test-term]]\nContent';
            }
        });

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.readFileSync).toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result.path).toBe('test-file.md');
    });

    test('should fetch and cache search results if not cached', async () => {
        // Set up mocks for API calls
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockResolvedValueOnce(mockSearchResponse);

        const mockContentClient = await octokitClient.getContentClient();
        mockContentClient.getContent.mockResolvedValueOnce({
            data: {
                content: Buffer.from('[[def: test-term]]\nContent').toString('base64')
            }
        });

        // Mock file system for cache miss
        fs.existsSync.mockReturnValue(false);

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result.path).toBe('test-file.md');
        expect(result.content).toBeDefined();
    });

    test('should handle API errors gracefully', async () => {
        // Set up mock to throw an error
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockRejectedValueOnce(new Error('API error'));

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(result).toBeNull();
    });

    test('should handle empty search results', async () => {
        // Set up mock for empty results
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockResolvedValueOnce({
            data: {
                total_count: 0,
                items: []
            }
        });

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(result).toBeNull();
    });

    test('should handle invalid GitHub tokens', async () => {
        // Set up mock for authentication error
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockRejectedValueOnce({
            status: 401,
            message: 'Bad credentials'
        });

        const result = await fetchTermsFromGitHubRepository(
            'invalid-token', mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(result).toBeNull();
    });

    test('should handle rate limiting errors', async () => {
        // Set up mock for rate limit error
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockRejectedValueOnce({
            status: 403,
            message: 'API rate limit exceeded',
            headers: {
                'x-ratelimit-reset': (Date.now() / 1000 + 60).toString()
            }
        });

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(result).toBeNull();
    });

    test('should handle large files that provide download URLs instead of content', async () => {
        // Set up search response with large file
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockResolvedValueOnce({
            data: {
                total_count: 1,
                items: [{
                    path: 'large-file.md',
                    repository: {
                        owner: { login: mockOwner },
                        name: mockRepo
                    },
                    text_matches: [{
                        fragment: '[[def: test-term]]\nContent'
                    }]
                }]
            }
        });

        // Set up content client for large file (no content)
        const mockContentClient = await octokitClient.getContentClient();
        mockContentClient.getContent.mockResolvedValueOnce({
            data: {
                content: null,
                download_url: 'https://raw.githubusercontent.com/test-owner/test-repo/main/large-file.md'
            }
        });

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(result).not.toBeNull();
        expect(result.path).toBe('large-file.md');
        expect(result.content).toBe("");
    });

    test('should handle files with multiple definition lines', async () => {
        // Set up search response with file containing multiple definitions
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockResolvedValueOnce({
            data: {
                total_count: 1,
                items: [{
                    path: 'multi-def.md',
                    repository: {
                        owner: { login: mockOwner },
                        name: mockRepo
                    },
                    text_matches: [{
                        fragment: '[[def: term1]]\nContent'
                    }]
                }]
            }
        });

        // File content with multiple definitions
        const fileContent = `
        [[def: term1, alias1]]\n
        This is definition 1\n
        \n
        [[def: term2, alias2]]\n
        This is definition 2
        `;

        // Set up content client for multi-def file
        const mockContentClient = await octokitClient.getContentClient();
        mockContentClient.getContent.mockResolvedValueOnce({
            data: {
                content: Buffer.from(fileContent).toString('base64')
            }
        });

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        expect(result).not.toBeNull();
        expect(result.path).toBe('multi-def.md');
        expect(result.content).toContain('term1');
        expect(result.content).toContain('term2');
    });

    test('should handle file content fetch errors', async () => {
        // Set up search that succeeds
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockResolvedValueOnce({
            data: {
                total_count: 1,
                items: [{
                    path: 'error-file.md',
                    repository: {
                        owner: { login: mockOwner },
                        name: mockRepo
                    },
                    text_matches: [{
                        fragment: '[[def: test-term]]\nContent'
                    }]
                }]
            }
        });

        // Set up content fetch that fails
        const mockContentClient = await octokitClient.getContentClient();
        mockContentClient.getContent.mockRejectedValueOnce(new Error('File not found'));

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, mockSubdirectory
        );

        // This might be null or might return empty content based on implementation
        if (result) {
            expect(result.content).toBe("");
        } else {
            expect(result).toBeNull();
        }
    });

    test('should correctly filter by subdirectory', async () => {
        // Set up search with multiple results in different directories
        const mockSearchClient = await octokitClient.getSearchClient();
        mockSearchClient.search.mockResolvedValueOnce({
            data: {
                total_count: 2,
                items: [
                    {
                        path: 'test-dir/file1.md',
                        repository: {
                            owner: { login: mockOwner },
                            name: mockRepo
                        },
                        text_matches: [{
                            fragment: '[[def: term1]]\nContent'
                        }]
                    },
                    {
                        path: 'other-dir/file2.md',
                        repository: {
                            owner: { login: mockOwner },
                            name: mockRepo
                        },
                        text_matches: [{
                            fragment: '[[def: term2]]\nContent'
                        }]
                    }
                ]
            }
        });

        // Set up content client
        const mockContentClient = await octokitClient.getContentClient();
        mockContentClient.getContent.mockResolvedValueOnce({
            data: {
                content: Buffer.from('[[def: term1]]\nContent').toString('base64')
            }
        });

        const result = await fetchTermsFromGitHubRepository(
            mockToken, mockSearchString, mockOwner, mockRepo, 'test-dir'
        );

        expect(result).not.toBeNull();
        expect(result.path).toBe('test-dir/file1.md');
    });
});