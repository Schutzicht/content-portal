import type { APIRoute } from 'astro';
import db from '../../db/database';
import { put } from '@vercel/blob';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.formData();
        
        const wat = data.get('wat')?.toString() || '';
        const details = data.get('details')?.toString() || '';
        const waar = data.get('waar')?.toString() || '';
        const contactPersoon = data.get('contactPersoon')?.toString() || '';
        const contactGegevens = data.get('contactGegevens')?.toString() || '';
        
        const files = data.getAll('fotos') as File[];
        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (file.size > 0 && file.name) {
                const blob = await put(file.name, file, { 
                    access: 'public',
                });
                uploadedUrls.push(blob.url);
            }
        }

        const fotosString = uploadedUrls.length > 0 ? uploadedUrls.join(', ') : null;

        await db.execute(
            `INSERT INTO wijzigingen_submissions (wat, details, waar, contactPersoon, contactGegevens, fotos) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [wat, details, waar, contactPersoon, contactGegevens, fotosString]
        );

        return new Response(JSON.stringify({ success: true, message: 'Wijziging succesvol ingediend' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
