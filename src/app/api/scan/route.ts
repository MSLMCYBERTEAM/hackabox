import { NextResponse } from 'next/server';
import net from 'net';

// একটি সিঙ্গেল পোর্ট স্ক্যান করার প্রমিজ ফাংশন
const checkPort = (port: number, host: string, timeout = 1500): Promise<{ port: number; status: 'open' | 'closed' }> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, status: 'open' });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, status: 'closed' });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({ port, status: 'closed' });
    });

    socket.connect(port, host);
  });
};

export async function POST(req: Request) {
  try {
    let { target } = await req.json();

    if (!target) {
      return NextResponse.json({ error: "Target host or IP is required." }, { status: 400 });
    }

    // URL বা প্রোটোকল থাকলে ক্লিন করে শুধু ডোমেইন/IP আলাদা করা
    let cleanHost = target.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];

    const targetPorts = [
      { port: 80, service: 'HTTP', info: 'Standard Unencrypted Web Traffic' },
      { port: 443, service: 'HTTPS', info: 'Secure Encrypted Web Traffic' },
      { port: 21, service: 'FTP', info: 'File Transfer Protocol Control Port' },
      { port: 22, service: 'SSH', info: 'Secure Shell Remote Login Service' },
      { port: 23, service: 'Telnet', info: 'Unencrypted Text Communications' },
      { port: 25, service: 'SMTP', info: 'Simple Mail Transfer Protocol' },
      { port: 53, service: 'DNS', info: 'Domain Name System Resolution' },
      { port: 3306, service: 'MySQL', info: 'MySQL Database Server Engine' },
    ];

    // সবগুলো পোর্ট একসাথে ডিস্ট্রিবিউটেড প্যারালাল স্ক্যান করা (সুপার ফাস্ট স্পীডের জন্য)
    const scanPromises = targetPorts.map(p => checkPort(p.port, cleanHost));
    const scanResults = await Promise.all(scanPromises);

    // সার্ভার রেসপন্সের সাথে সার্ভিসের নাম ও ডিটেইলস ম্যাপ করা
    const finalReport = targetPorts.map((p, index) => ({
      ...p,
      status: scanResults[index].status
    }));

    return NextResponse.json({ success: true, host: cleanHost, results: finalReport });

  } catch (error: any) {
    return NextResponse.json({ error: `Network exception: ${error.message}` }, { status: 500 });
  }
}