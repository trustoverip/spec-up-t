/**
 * @fileoverview Tests getUnpublishedFiles against a real local repository
 * whose "GitHub" is a bare repository on disk.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { getUnpublishedFiles } = require('./utils/git-info');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });

let root;
let work;

function commitFile(file) {
    const full = path.join(work, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, file);
    git(work, 'add', '--', file);
    git(work, 'commit', '-q', '-m', `Add ${file}`);
}

beforeEach(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'spec-up-t-git-')));
    work = path.join(root, 'work');
    git(root, 'init', '-q', '--bare', 'remote.git');
    git(root, 'init', '-q', '-b', 'main', 'work');
    git(work, 'config', 'user.email', 'test@example.com');
    git(work, 'config', 'user.name', 'Test');
    git(work, 'config', 'commit.gpgsign', 'false');
    git(work, 'remote', 'add', 'origin', path.join(root, 'remote.git'));
    commitFile('images/pushed.png');
    git(work, 'push', '-q', '-u', 'origin', 'main');
});

afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
});

describe('getUnpublishedFiles', () => {
    test('reports untracked and unpushed files, not pushed ones', () => {
        commitFile('images/committed.png');
        fs.writeFileSync(path.join(work, 'images', 'untracked.png'), 'x');

        const files = ['images/pushed.png', 'images/committed.png', 'images/untracked.png'];
        expect(getUnpublishedFiles(files, 'main', work)).toEqual([
            'images/committed.png',
            'images/untracked.png'
        ]);
    });

    test('reports every file on a branch that has never been pushed', () => {
        git(work, 'checkout', '-q', '-b', 'add-images');
        expect(getUnpublishedFiles(['images/pushed.png'], 'add-images', work)).toEqual(['images/pushed.png']);
    });

    test('uses origin/<branch> when the branch has no upstream', () => {
        git(work, 'checkout', '-q', '-b', 'add-images');
        git(work, 'push', '-q', 'origin', 'add-images');
        commitFile('images/new.png');

        expect(getUnpublishedFiles(['images/pushed.png', 'images/new.png'], 'add-images', work))
            .toEqual(['images/new.png']);
    });

    test('treats file names literally, not as patterns', () => {
        commitFile('images/[draft].png');
        git(work, 'push', '-q');
        expect(getUnpublishedFiles(['images/[draft].png', 'images/d.png'], 'main', work))
            .toEqual(['images/d.png']);
    });

    test('skips the check when the build branch is not the checked-out branch', () => {
        expect(getUnpublishedFiles(['images/missing.png'], 'other', work)).toEqual([]);
    });

    test('skips the check on a detached checkout', () => {
        git(work, 'checkout', '-q', '--detach');
        expect(getUnpublishedFiles(['images/missing.png'], 'main', work)).toEqual([]);
    });

    test('skips the check outside a git repository', () => {
        const plain = path.join(root, 'plain');
        fs.mkdirSync(plain);
        expect(getUnpublishedFiles(['images/a.png'], 'main', plain)).toEqual([]);
    });
});
