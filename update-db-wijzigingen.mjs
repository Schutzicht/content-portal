import { createClient } from '@libsql/client/web';

const url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const db = createClient({ url, authToken });

async function updateSchema() {
    console.log('Running schema update for Website Wijzigingen...');
    
    // Create new table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS wijzigingen_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wat TEXT NOT NULL,
            details TEXT NOT NULL,
            waar TEXT,
            fotos TEXT,
            contactPersoon TEXT NOT NULL,
            contactGegevens TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Created wijzigingen_submissions table.');

    // Add module setting
    try {
        await db.execute('ALTER TABLE settings ADD COLUMN module_wijzigingen INTEGER DEFAULT 1');
        console.log('Added module_wijzigingen to settings.');
    } catch(e) {
        console.log('Column module_wijzigingen might already exist.');
    }

    console.log('Update finished.');
}

updateSchema().catch(console.error);
