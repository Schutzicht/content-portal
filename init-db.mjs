import { createClient } from '@libsql/client/web';
import 'dotenv/config';

const url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const db = createClient({ url, authToken });

async function main() {
    console.log('Connecting to database...');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS social_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          wat TEXT NOT NULL,
          waar TEXT,
          waarom TEXT,
          timing TEXT,
          partners TEXT,
          toelichting TEXT,
          fotos TEXT,
          contactPersoon TEXT,
          contactGegevens TEXT,
          verplichtingen TEXT
        );
    `);
    console.log('Social submissions table ready.');

    await db.execute(`
        CREATE TABLE IF NOT EXISTS nieuws_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          titel TEXT NOT NULL,
          inhoud TEXT NOT NULL,
          doelgroep TEXT,
          wanneer TEXT,
          betrokkenen TEXT,
          fotos TEXT,
          contactPersoon TEXT,
          contactGegevens TEXT
        );
    `);
    console.log('Nieuws submissions table ready.');

      // ============================================
      // 3. Create 'settings' table (SaaS Customization)
      // ============================================
      console.log('Creating settings table...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          site_title TEXT NOT NULL,
          logo_url TEXT,
          primary_color TEXT NOT NULL,
          team_members TEXT
        );
      `);

      // Initialize default settings if none exist
      const checkSettings = await db.execute('SELECT COUNT(*) as count FROM settings');
      if (checkSettings.rows[0].count === 0) {
        console.log('Inserting default settings...');
        await db.execute(`
          INSERT INTO settings (id, site_title, logo_url, primary_color, team_members)
          VALUES (1, 'Content Portal', '', '#2D3FE0', '[]')
        `);
      } else {
        console.log('Settings already exist.');
      }

    console.log('All tables successfully initialized!');
}

main().catch(console.error);
