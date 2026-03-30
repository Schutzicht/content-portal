import type { APIRoute } from 'astro';
import db from '../../db/database';

import { put } from '@vercel/blob';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.formData();

        const wat = data.get('wat')?.toString() || '';
        const waar = data.get('waar')?.toString() || '';
        const waarom = data.get('waarom')?.toString() || '';
        const partners = data.get('partners')?.toString() || '';
        const toelichting = data.get('toelichting')?.toString() || '';
        const contactPersoon = data.get('contactPersoon')?.toString() || '';
        const contactGegevens = data.get('contactGegevens')?.toString() || '';
        const verplichtingen = data.get('verplichtingen')?.toString() || '';

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

        // Timing logic (custom vs radio)
        const timingRadio = data.get('timing')?.toString();
        const timingCustom = data.get('customDate')?.toString();
        const timing = (timingRadio === 'Anders' && timingCustom) ? `Datum: ${timingCustom}` : (timingRadio || 'Geen haast');

        if (!wat) {
            return new Response(JSON.stringify({ success: false, error: 'Vul de verplichte velden in.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await db.execute(
            `INSERT INTO social_submissions (wat, waar, waarom, timing, partners, toelichting, fotos, contactPersoon, contactGegevens, verplichtingen)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [wat, waar, waarom, timing, partners, toelichting, fotos, contactPersoon, contactGegevens, verplichtingen]
        );

        return new Response(JSON.stringify({ success: true, message: '✅ Social update succesvol ingediend!' }), {
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
