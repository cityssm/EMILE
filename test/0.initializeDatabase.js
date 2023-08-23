import * as assert from 'node:assert';
import fs from 'node:fs/promises';
import { initializeDatabase } from '../database/initializeDatabase.js';
import { databasePath, useTestDatabases } from '../helpers/functions.database.js';
describe('Initialize Database', () => {
    it('initializes an EMILE database', async () => {
        if (!useTestDatabases) {
            assert.fail('Test database must be used!');
        }
        try {
            await fs.unlink(databasePath);
        }
        catch {
        }
        initializeDatabase();
        assert.ok(true);
    });
});
