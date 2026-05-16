import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: "Username parameter is required." }, { status: 400 });
  }

  // ওসিন্ট ডাটাবেজ: বিভিন্ন ক্যাটাগরির পপুলার সোশ্যাল এবং টেক প্ল্যাটফর্মের লিস্ট
  const targetSites = [
    { name: 'GitHub', url: `https://github.com/${username}` },
    { name: 'Twitter / X', url: `https://x.com/${username}` },
    { name: 'Instagram', url: `https://www.instagram.com/${username}/` },
    { name: 'Pinterest', url: `https://www.pinterest.com/${username}/` },
    { name: 'Reddit', url: `https://www.reddit.com/user/${username}/` },
    { name: 'YouTube', url: `https://www.youtube.com/@${username}` },
    { name: 'SoundCloud', url: `https://soundcloud.com/${username}` },
    { name: 'Dev.to', url: `https://dev.to/${username}` },
    { name: 'Medium', url: `https://medium.com/@${username}` },
    { name: 'Behance', url: `https://www.behance.net/${username}` },
    { name: 'Dribbble', url: `https://dribbble.com/${username}` },
    { name: 'TikTok', url: `https://www.tiktok.com/@${username}` },
    { name: 'Spotify', url: `https://open.spotify.com/user/${username}` },
    { name: 'Vimeo', url: `https://vimeo.com/${username}` },
    { name: 'Twitch', url: `https://www.twitch.tv/${username}` },
    { name: 'Steam', url: `https://steamcommunity.com/id/${username}` },
    { name: 'Discourse', url: `https://meta.discourse.org/u/${username}` },
    { name: 'Patreon', url: `https://www.patreon.com/${username}` },
    { name: 'DailyMotion', url: `https://www.dailymotion.com/${username}` },
    { name: 'GitLab', url: `https://gitlab.com/${username}` },
    { name: 'CodePen', url: `https://codepen.io/${username}` },
    { name: 'ProductHunt', url: `https://www.producthunt.com/@${username}` },
    { name: 'Linktree', url: `https://linktr.ee/${username}` },
    { name: 'About.me', url: `https://about.me/${username}` },
    { name: 'Tumblr', url: `https://${username}.tumblr.com` },
    { name: 'Scratch', url: `https://scratch.mit.edu/users/${username}/` },
    { name: 'SlideShare', url: `https://www.slideshare.net/${username}` },
    { name: 'Keybase', url: `https://keybase.io/${username}` },
    { name: 'Instructables', url: `https://www.instructables.com/member/${username}/` },
    { name: 'BuyMeACoffee', url: `https://www.buymeacoffee.com/${username}` },
    { name: 'Giphy', url: `https://giphy.com/${username}` },
    { name: 'Letterboxd', url: `https://letterboxd.com/${username}/` },
    { name: 'Flickr', url: `https://www.flickr.com/photos/${username}/` },
    { name: 'WordPress', url: `https://${username}.wordpress.com` },
    { name: 'LiveJournal', url: `https://${username}.livejournal.com` },
    { name: 'Bandcamp', url: `https://bandcamp.com/${username}` },
    { name: 'Mixcloud', url: `https://www.mixcloud.com/${username}/` },
    { name: 'ReverbNation', url: `https://www.reverbnation.com/${username}` },
    { name: 'Goodreads', url: `https://www.goodreads.com/${username}` },
    { name: 'Wikipedia User', url: `https://en.wikipedia.org/wiki/User:${username}` },
    { name: 'Duolingo', url: `https://www.duolingo.com/profile/${username}` },
    { name: 'Kaggle', url: `https://www.kaggle.com/${username}` },
    { name: 'DockerHub', url: `https://hub.docker.com/u/${username}` },
    { name: 'DeviantArt', url: `https://www.deviantart.com/${username}` },
    { name: 'Imgur', url: `https://imgur.com/user/${username}` },
    { name: 'Snapchat', url: `https://www.snapchat.com/add/${username}` },
    { name: 'Substack', url: `https://${username}.substack.com` },
    { name: 'Freelancer', url: `https://www.freelancer.com/u/${username}` },
    { name: 'Fiverr', url: `https://www.fiverr.com/${username}` },
    { name: 'Upwork', url: `https://www.upwork.com/freelancers/~${username}` },
    // স্ক্রিপ্ট সাইজ এবং স্পিড ব্যালেন্স রাখার জন্য এখানে ৫০টি টপ হাই-হিট গ্লোবাল প্ল্যাটফর্ম ম্যাট্রিক্স ডিফাইন করা হলো
  ];

  const encoder = new TextEncoder();

  // Server-Sent Streams জেনারেট করা
  const stream = new ReadableStream({
    async start(controller) {
      
      // প্যারালাল রিকোয়েস্ট পুল এক্সিকিউশন
      const promises = targetSites.map(async (site) => {
        try {
          const res = await fetch(site.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            next: { revalidate: 0 }
          });

          // বেশিরভাগ সাইটে প্রোফাইল না থাকলে 404 দেয়। যদি ২০০ দেয় বা সাকসেসফুলি পেজ রেন্ডার হয়, তবে প্রোফাইল এক্সিস্ট করে।
          // কিছু সাইট যেমন ইনস্টাগ্রাম/এক্স মাঝে মাঝে ৪০০ দেয় যদি অথেনটিকেশন চায়, তবে ২০০ রেসপন্স জেনুইন হিট।
          if (res.status === 200) {
            const dataPayload = JSON.stringify({ name: site.name, url: site.url, status: 'CLAIMED' });
            controller.enqueue(encoder.encode(`data: ${dataPayload}\n\n`));
          } else {
            const dataPayload = JSON.stringify({ name: site.name, url: site.url, status: 'AVAILABLE' });
            controller.enqueue(encoder.encode(`data: ${dataPayload}\n\n`));
          }
        } catch (err) {
          const dataPayload = JSON.stringify({ name: site.name, url: site.url, status: 'ERROR' });
          controller.enqueue(encoder.encode(`data: ${dataPayload}\n\n`));
        }
      });

      // সব রিকোয়েস্ট শেষ হওয়া পর্যন্ত অপেক্ষা করে স্ট্রিম ক্লোজ করা
      await Promise.all(promises);
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}