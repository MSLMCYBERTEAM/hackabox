import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Target URL is required." }, { status: 400 });
    }

    // ইউআরএল ফরম্যাট ভ্যালিডেশন
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // টার্গেট সাইটে রিকোয়েস্ট পাঠানো (স্প্যাম বটের মতো রিঅ্যাক্ট না করতে User-Agent সেট করা)
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ForensicScraper/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 8000 // ৮ সেকেন্ডের মধ্যে রেসপন্স না আসলে টাইমআউট
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // --- ১. মেটা ডেটা ইন্টেলিজেন্স ---
    const metaIntel = {
      title: $('title').text() || 'No Title Found',
      description: $('meta[name="description"]').attr('content') || 'No Description Tag',
      keywords: $('meta[name="keywords"]').attr('content') || 'No Keywords Tag',
      generator: $('meta[name="generator"]').attr('content') || 'Undetected CMS/Framework',
    };

    // --- ২. লিংক ম্যাপিং ---
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        if (href.startsWith('/') || href.includes(new URL(targetUrl).hostname)) {
          internalLinks.push(href);
        } else if (href.startsWith('http')) {
          externalLinks.push(href);
        }
      }
    });

    // --- ৩. অ্যাসেট ডিসকভারি ---
    const images: string[] = [];
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      if (src) images.push(src);
    });

    const scripts: string[] = [];
    $('script').each((_, element) => {
      const src = $(element).attr('src');
      if (src) scripts.push(src);
    });

    // --- ৪. সিকিউরিটি এবং কুকি অ্যানালাইসিস ---
    const headers = response.headers;
    const securityAnalysis = {
      server: headers['server'] || 'Hidden / Cloudflare Masked',
      poweredBy: headers['x-powered-by'] || 'Secure / Hidden',
      sslActive: targetUrl.startsWith('https') ? 'YES (Encrypted)' : 'NO (Vulnerable)',
      cookiesLeaked: headers['set-cookie'] ? `${headers['set-cookie'].length} Active Cookies Dropped` : 'None detected'
    };

    return NextResponse.json({
      success: true,
      target: targetUrl,
      metaIntel,
      links: {
        internalCount: internalLinks.length,
        externalCount: externalLinks.length,
        externalList: Array.from(new Set(externalLinks)).slice(0, 15) // টপ ১৫টি ইউনিক এক্সটারনাল লিংক
      },
      assets: {
        imageCount: images.length,
        scriptCount: scripts.length
      },
      securityAnalysis
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: `Failed to scrape target payload. Server replied: ${err.message || 'Network Timeout'}` 
    }, { status: 500 });
  }
}