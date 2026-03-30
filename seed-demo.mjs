import { createClient } from '@libsql/client/web';

const url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

const db = createClient({ url, authToken });

async function seed() {
    console.log('Verwijder oude logge demo data...');
    await db.execute('DELETE FROM social_submissions');
    await db.execute('DELETE FROM nieuws_submissions');

    console.log('Inserting nieuwe realistische "aanlever" data...');

    // 1. Insert Realistic Social Post
    await db.execute({
        sql: `INSERT INTO social_submissions 
              (wat, waar, waarom, timing, partners, toelichting, fotos, contactPersoon, contactGegevens, verplichtingen) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            'Event bezocht gisteren!',
            'Jaarbeurs Utrecht',
            'Laten zien dat we actief zijn op beurzen',
            'Deze week',
            '@InnovatieEventNL',
            'Hey team, Ruben en ik waren gisteren bij het innovatie-event in Utrecht. Was echt heel tof, we hebben best wat relaties gesproken. We hebben foto\'s gemaakt bij onze stand. Oh ja, tijdens de presentatie over duurzaamheid werden we ook nog even goed op het podium benoemd als belangrijke partner! Zouden jullie hier een vlotte LinkedIn post van kunnen maken om ze te bedanken voor de vermelding en mooie dag?',
            'https://we.tl/t-dummy12345',
            'Ruben',
            '06-12345678',
            'Tag InnovatieEventNL graag.'
        ]
    });

    console.log('Realistic Social Post inserted.');

    // 2. Insert Realistic Nieuwsartikel
    await db.execute({
        sql: `INSERT INTO nieuws_submissions 
              (titel, inhoud, doelgroep, wanneer, betrokkenen, fotos, contactPersoon, contactGegevens) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            'Nieuwe stagiaires gestart',
            'Hoi! Vandaag zijn er 3 nieuwe stagiaires bij ons gestart op de marketing. Floris, Lisa en Mo. Ze komen afsturen vanuit de Hogeschool Zeeland en blijven een half jaar om ons te helpen met marktonderzoek. Het leek mij een heel leuk idee om hier een kort en vrolijk artikeltje over te schrijven voor onze \'Over Ons\' websitepagina of in de volgende nieuwsbrief, zodat de rest van de klanten en het bedrijf ook meteen weet wie ze zijn.',
            'Personeel & vaste klanten',
            'Geen haast',
            'Floris, Lisa, Mo (de stagiairs)',
            'https://unsplash.com/photos/demo-interns',
            'Arieke',
            'arieke@bedrijf.nl'
        ]
    });

    console.log('Realistic Nieuwsartikel inserted.');
    console.log('Klaar met invoeren!');
}

seed().catch(console.error);
