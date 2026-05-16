import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { ipOrDomain } = await req.json();

    if (!ipOrDomain) {
      return NextResponse.json({ error: "Target IP or Domain is required." }, { status: 400 });
    }

    // ডোমেইন থেকে http/https বা স্ল্যাশ থাকলে তা ক্লিন করে শুধু কোর হোস্টনেম বের করা
    const cleanTarget = ipOrDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];

    // ip-api এর রিয়েল-টাইম জিওলোকেশন এন্ডপয়েন্ট কল করা
    // এখানে এক্সট্রা ফিল্ডস (status, country, city, lat, lon, isp, query) রিকোয়েস্ট করা হয়েছে
    const response = await fetch(`http://ip-api.com/json/${cleanTarget}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    const data = await response.json();

    if (data.status === 'fail') {
      return NextResponse.json({ error: data.message || "Invalid target or private IP space." }, { status: 400 });
    }

    return NextResponse.json({ success: true, geoData: data });

  } catch (error: any) {
    return NextResponse.json({ error: `OSINT Gateway Timeout: ${error.message}` }, { status: 500 });
  }
}