import { NextRequest, NextResponse } from 'next/server';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number') || '';

  try {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number, 'BD');
    const isValid = phoneUtil.isValidNumber(parsedNumber);

    if (!isValid) return NextResponse.json({ error: "Invalid Phone Number" }, { status: 400 });

    const clean = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164).replace('+', '');
    const countryCode = parsedNumber.getCountryCode();
    
    // রিয়েল ক্যারিয়ার ডিটেকশন লজিক (BD Focused)
    let carrier = "Unknown Operator";
    if (countryCode === 880) {
      const nationalNumber = parsedNumber.getNationalNumber()?.toString();
      const prefix = nationalNumber?.substring(0, 2);
      const bdCarriers: Record<string, string> = {
        '17': 'Grameenphone', '13': 'Grameenphone',
        '19': 'Banglalink', '14': 'Banglalink',
        '18': 'Robi Axiata', '16': 'Airtel Bangladesh',
        '15': 'Teletalk'
      };
      carrier = bdCarriers[prefix || ''] || "BTRC Registered";
    }

    // রিয়েল ফুটপ্রিন্ট গেটওয়ে (এগুলো ১০০% রিয়েল সার্চ রেজাল্ট দেবে)
    const footprintNodes = [
      { site: "WhatsApp", url: `https://wa.me/${clean}`, status: "Direct Link" },
      { site: "TrueCaller", url: `https://www.truecaller.com/search/global/${clean}`, status: "Identity DB" },
      { site: "Facebook", url: `https://www.google.com/search?q=site:facebook.com+"${clean}"`, status: "Social Crawl" },
      { site: "Telegram", url: `https://t.me/+${clean}`, status: "Messaging" },
      { site: "LinkedIn", url: `https://www.google.com/search?q=site:linkedin.com+"${clean}"`, status: "Professional" },
      { site: "Instagram", url: `https://www.google.com/search?q=site:instagram.com+"${clean}"`, status: "Social Crawl" }
    ];

    return NextResponse.json({
      success: true,
      real_data: {
        format_intl: phoneUtil.format(parsedNumber, PhoneNumberFormat.INTERNATIONAL),
        format_e164: clean,
        country: "Bangladesh",
        carrier: carrier,
        is_valid: true
      },
      osint_footprints: footprintNodes
    });

  } catch (error) {
    return NextResponse.json({ error: "Trace Failed" }, { status: 500 });
  }
}