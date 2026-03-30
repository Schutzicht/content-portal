import type { APIRoute } from 'astro';
import db from '../../db/database';
import { put } from '@vercel/blob';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.formData();

        const wat = data.get('wat')?.toString() || '';         // titel
        const toelichting = data.get('toelichting')?.toString() || ''; // artikel inhoud
        const waarom = data.get('waarom')?.toString() || '';   // doelgroep
        const wanneer = data.get('wanneer')?.toString() || ''; // publicatietijd
        const partners = data.get('partners')?.toString() || ''; // betrokkenen/bronnen
        const contactPersoon = data.get('contactPersoon')?.toString() || '';
        const contactGegevens = data.get('contactGegevens')?.toString() || '';

        // Media handeling
        const fotosLink = data.get('fotosLink')?.toString() || '';
        const fotosUploads = data.getAll('fotosUpload') as File[];
        let uploadedUrls: string[] = [];

        for (const file of fotosUploads) {
            if (file && file.size > 0 && file.name) {
                // Upload file to Vercel Blob
                const blob = await put(file.name, file, { 
                    access: 'public',
                    multipart: true // Helps with larger files like video
                });
                uploadedUrls.push(blob.url);
            }
        }
        
        // Combine manually pasted link with uploaded vercel blob urls
        const fotos = [fotosLink, ...uploadedUrls].filter(Boolean).join(', ');

        if (!wat || !toelichting) {
            return new Response(JSON.stringify({ success: false, error: 'Vul de verplichte velden (Titel & Inhoud) in.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await db.execute(
            `INSERT INTO nieuws_submissions (titel, inhoud, doelgroep, wanneer, betrokkenen, fotos, contactPersoon, contactGegevens)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [wat, toelichting, waarom, wanneer, partners, fotos, contactPersoon, contactGegevens]
        );

        return new Response(JSON.stringify({ success: true, message: '✅ Nieuwsartikel succesvol ingediend!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Interne server fout.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
