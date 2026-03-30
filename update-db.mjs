import { createClient } from '@libsql/client/web';

const url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const db = createClient({ url, authToken });

async function updateSchema() {
    console.log('Adding module columns to settings table...');
    try {
        await db.execute('ALTER TABLE settings ADD COLUMN module_social INTEGER DEFAULT 1');
        console.log('Added module_social column.');
    } catch(e) {
        console.log('Column module_social might already exist.');
    }

    try {
        await db.execute('ALTER TABLE settings ADD COLUMN module_nieuws INTEGER DEFAULT 1');
        console.log('Added module_nieuws column.');
    } catch(e) {
        console.log('Column module_nieuws might already exist.');
    }
}

updateSchema().catch(console.error);
