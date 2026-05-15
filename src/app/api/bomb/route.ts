import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { number } = await request.json();
    const cleanNumber = number.replace('+88', '').replace(/^88/, '').trim();

    const response = await fetch('https://steadfast.com.bd/api/v1/register/send-otp', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' 
      },
      body: JSON.stringify({ phone: cleanNumber }),
    });

    const data = await response.json();
    console.log("Server Response:", data); // এই লাইনটি আপনার VS Code টার্মিনালে চেক করুন

    return NextResponse.json({ success: response.ok, data });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Connection Failed" });
  }
}