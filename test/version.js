import * as assert from 'node:assert';
import fs from 'node:fs';
import { version } from '../version.js';
describe('version.js', () => {
    it('Has a version that matches the package.json', () => {
        const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(version, packageJSON.version);
    });
});
