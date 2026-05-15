import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
  
  if (!url.startsWith('http')) url = `https://${url}`;

  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      },
      next: { revalidate: 0 }
    });

    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    const headerStr = JSON.stringify(headers).toLowerCase();
    const stack: any[] = [];

    const detect = (name: string, cat: string, pattern: string | RegExp, target: string) => {
      const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
      if (regex.test(target)) {
        if (!stack.some(s => s.name === name)) stack.push({ name, category: cat });
      }
    };

    // --- 1. FRONTEND FRAMEWORKS & LIBS ---
    detect('Next.js', 'Frontend Framework', '_next/static|/_next/', html);
    detect('React', 'JavaScript Library', 'react|react-dom', html);
    detect('Vue.js', 'Frontend Framework', 'vuejs|v-cloak', html);
    detect('Angular', 'Frontend Framework', 'ng-version|ng-app', html);
    detect('jQuery', 'JavaScript Library', 'jquery', html);
    detect('Svelte', 'Frontend Framework', 'svelte-', html);

    // --- 2. CSS FRAMEWORKS ---
    detect('Tailwind CSS', 'UI Framework', 'tailwind', html);
    detect('Bootstrap', 'UI Framework', 'bootstrap', html);
    detect('Chakra UI', 'UI Framework', 'chakra-ui', html);
    detect('Mantine', 'UI Framework', 'mantine', html);

    // --- 3. CMS & E-COMMERCE ---
    detect('WordPress', 'CMS', 'wp-content|wp-includes', html);
    detect('Shopify', 'Ecommerce', 'shopify', html);
    detect('Wix', 'CMS', 'wix-style', html);
    detect('Squarespace', 'CMS', 'squarespace', html);

    // --- 4. BACKEND & LANGUAGES ---
    if (headers['x-powered-by']) detect(headers['x-powered-by'], 'Backend Tech', '.*', headers['x-powered-by']);
    detect('PHP', 'Programming Language', /\.php|php\//, html);
    detect('Node.js', 'Runtime', 'node_modules', html);
    detect('Laravel', 'Backend Framework', 'laravel_session', headerStr);
    detect('Django', 'Backend Framework', 'csrftoken', headerStr);

    // --- 5. INFRASTRUCTURE & SERVERS ---
    if (headers['server']) detect(headers['server'], 'Web Server', '.*', headers['server']);
    detect('Vercel', 'Hosting/Deployment', 'x-vercel-id|vercel', headerStr);
    detect('Netlify', 'Hosting/Deployment', 'nf-request-id', headerStr);
    detect('Cloudflare', 'CDN/WAF', 'cf-ray|__cf_bm|cloudflare', headerStr);
    detect('Amazon S3', 'Storage', 's3.amazonaws.com', html);
    detect('Nginx', 'Web Server', 'nginx', headerStr);

    // --- 6. ANALYTICS & TOOLS ---
    detect('Google Analytics', 'Analytics', 'googletagmanager|ga.js|UA-', html);
    detect('Facebook Pixel', 'Marketing', 'fbevents.js', html);
    detect('Hotjar', 'Analytics', 'static.hotjar.com', html);
    detect('Sentry', 'Error Tracking', 'sentry.io', html);

    // --- 7. SECURITY & ENCRYPTION ---
    detect('HSTS Enabled', 'Security', 'strict-transport-security', headerStr);
    detect('Content Security Policy', 'Security', 'content-security-policy', headerStr);

    return NextResponse.json({ 
      success: true, 
      target: url,
      stack: stack.length > 0 ? stack : [{ name: 'Unknown Stack', category: 'General' }] 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Target blocked request or unreachable' }, { status: 500 });
  }
}