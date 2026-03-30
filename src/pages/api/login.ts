import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { username, password } = data;

        if (username === 'admin' && password === 'admin') {
            cookies.set('portal_auth', 'authenticated', {
                path: '/',
                httpOnly: true,
                secure: import.meta.env.PROD,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 dagen
            });

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, error: 'Ongeldige inloggegevens' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Server fout' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
