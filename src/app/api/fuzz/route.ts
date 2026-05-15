import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');

  if (!target) {
    return NextResponse.json({ error: 'URL missing' }, { status: 400 });
  }

  try {
    // ১. অনেক সময় HEAD মেথড ব্লক থাকে, তাই আমরা GET ব্যবহার করবো কিন্তু বডি নিবো না
    // ২. রিয়েল ব্রাউজারের মতো Header সেট করা যাতে সার্ভার ব্লক না করে
    const response = await fetch(target, { 
      method: 'GET', 
      cache: 'no-store',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://google.com', // রেফারার হিসেবে গুগল দিচ্ছি যাতে ট্রাস্ট বাড়ে
      },
      next: { revalidate: 0 } 
    });

    // আমরা ৩টি জিনিস রিটার্ন করবো যা আমাদের ফ্রন্টএন্ডে দরকার
    return NextResponse.json({ 
      status: response.status,
      exists: response.status !== 404, // ৪০৪ না হলেই ফাইল বা ডিরেক্টরি থাকার সম্ভাবনা আছে
      headers: {
        server: response.headers.get('server') || 'Unknown',
        type: response.headers.get('content-type') || 'Unknown',
        length: response.headers.get('content-length') || '0'
      }
    });

  } catch (error: any) {
    // যদি কানেকশন ফেইল হয় (যেমন সাইট ডাউন বা প্রক্সি ব্লক)
    return NextResponse.json({ 
      exists: false, 
      status: 500,
      error: error.message 
    }, { status: 200 }); // ফ্রন্টএন্ডে ক্র্যাশ না হওয়ার জন্য ২০০ দিচ্ছি
  }
}