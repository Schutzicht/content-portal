import type { APIRoute } from 'astro';
import db from '../../db/database';
import { put } from '@vercel/blob';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.formData();
        
        const siteTitle = data.get('siteTitle')?.toString() || 'Content Portal';
        const primaryColor = data.get('primaryColor')?.toString() || '#2D3FE0';
        const teamMembers = data.get('teamMembers')?.toString() || '';
        
        const moduleSocial = data.get('moduleSocial') === 'on' ? 1 : 0;
        const moduleNieuws = data.get('moduleNieuws') === 'on' ? 1 : 0;
        const moduleWijzigingen = data.get('moduleWijzigingen') === 'on' ? 1 : 0;

        const logoFile = data.get('logoFile') as File | null;
        let logoUrl = data.get('currentLogoUrl')?.toString() || '';

        if (logoFile && logoFile.size > 0 && logoFile.name) {
            const blob = await put(logoFile.name, logoFile, { 
                access: 'public',
            });
            logoUrl = blob.url;
        }

        await db.execute(
            `UPDATE settings 
             SET site_title = ?, logo_url = ?, primary_color = ?, team_members = ?, module_social = ?, module_nieuws = ?, module_wijzigingen = ? 
             WHERE id = 1`,
            [siteTitle, logoUrl, primaryColor, teamMembers, moduleSocial, moduleNieuws, moduleWijzigingen]
        );

        return new Response(JSON.stringify({ success: true, message: 'Settings saved successfully' }), {
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
