import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let target = searchParams.get('url');

  if (!target) return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  if (!target.startsWith('http')) target = `https://${target}`;

  const findings: any[] = [];
  const startTime = Date.now();

  try {
    const response = await fetch(`${target}?cache_bust=${startTime}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      cache: 'no-store'
    });

    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    const lowerHtml = html.toLowerCase();

    // --- (আগের সব checkSecurity ফাংশন এবং কোড এখানে থাকবে) ---
    const checkSecurity = (id: string, header: string, severity: string, strategy: string, payload: string) => {
      if (!headers[header.toLowerCase()]) {
        findings.push({
          type: `Missing ${id}`,
          severity,
          detail: `The ${id} header is not implemented.`,
          exploit: strategy,
          payload: payload
        });
      }
    };

    // --- ১. আপনার আগের সব চেকগুলো (একই থাকবে) ---
    checkSecurity('CSP', 'Content-Security-Policy', 'High', 'Bypass frontend restrictions to execute XSS.', `<script>alert(1)</script>`);
    checkSecurity('HSTS', 'Strict-Transport-Security', 'Medium', 'Downgrade to HTTP for sniffing.', 'Use Bettercap.');
    checkSecurity('X-Frame', 'X-Frame-Options', 'Low', 'UI Redressing.', `<iframe>`);

    // --- ২. নতুন সুপার অ্যাডভান্সড চেকসমূহ (এখানে নতুনগুলো যোগ হলো) ---

    // A. Subdomain Takeover (CNAME pointing to dead service)
    if (lowerHtml.includes('nosuchbucket') || lowerHtml.includes('there is no app here')) {
      findings.push({
        type: 'Subdomain Takeover',
        severity: 'Critical',
        detail: 'The domain points to a service (S3/Heroku) that is no longer active.',
        exploit: 'Claim this subdomain by creating a new account on the respective service.',
        payload: 'Tool: subjack -d target.com'
      });
    }

    // B. Git Repository Exposure
    if (lowerHtml.includes('git-receive-pack') || lowerHtml.includes('ref: refs/heads/')) {
      findings.push({
        type: 'Git Exposure',
        severity: 'Critical',
        detail: '.git directory or data is publicly accessible.',
        exploit: 'Download the entire source code and history of the project.',
        payload: `${target}/.git/config`
      });
    }

    // C. WordPress Specific Vulnerability
    if (lowerHtml.includes('/wp-content/') || lowerHtml.includes('/wp-includes/')) {
      findings.push({
        type: 'WordPress Detected',
        severity: 'Info',
        detail: 'The site is running on WordPress.',
        exploit: 'Scan for outdated plugins or themes using WPScan.',
        payload: `wpscan --url ${target}`
      });
    }

    // D. Insecure CORS Configuration
    if (headers['access-control-allow-origin'] === '*') {
      findings.push({
        type: 'Insecure CORS',
        severity: 'Medium',
        detail: 'Access-Control-Allow-Origin is set to wildcard (*).',
        exploit: 'Perform a Cross-Site Request Forgery (CSRF) to steal sensitive user data.',
        payload: 'Header: Access-Control-Allow-Origin: *'
      });
    }

    // E. Drupal/PHP Version Disclosure
    if (headers['x-generator'] || lowerHtml.includes('drupal')) {
      findings.push({
        type: 'CMS Disclosure',
        severity: 'Low',
        detail: 'CMS and its version are leaked via X-Generator header.',
        exploit: 'Search for public exploits for this specific CMS version.',
        payload: headers['x-generator'] || 'Drupal Detection'
      });
    }

    // F. Email Leakage (OSINT Prep)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = html.match(emailRegex);
    if (foundEmails && foundEmails.length > 0) {
      findings.push({
        type: 'Information Leakage (Emails)',
        severity: 'Low',
        detail: `Found ${foundEmails.length} public email addresses in source code.`,
        exploit: 'Use these emails for targeted Phishing or Social Engineering attacks.',
        payload: foundEmails.slice(0, 3).join(', ')
      });
    }

    // --- ৩. আগের রেগুলার এক্সপ্রেশন এবং লজিকগুলো (নিচে একই থাকবে) ---
    const sqlRegex = /(sql syntax|mysql_fetch|pdoexception|unclosed quotation|oracle error|db2 error|sqlite_)/i;
    if (sqlRegex.test(lowerHtml)) {
        findings.push({ type: 'SQL Injection Leak', severity: 'Critical', detail: 'Database driver errors visible.', exploit: 'UNION based extraction.', payload: `' UNION SELECT 1--` });
    }

    return NextResponse.json({
      success: true,
      target,
      scanTime: `${(Date.now() - startTime) / 1000}s`,
      findings: findings.length > 0 ? findings : [{ type: 'Secure', severity: 'None', detail: 'No common vulnerabilities detected.' }]
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Connection Refused' }, { status: 500 });
  }
}