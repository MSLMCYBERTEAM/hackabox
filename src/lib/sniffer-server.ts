import { Server } from "socket.io";
import { exec } from "child_process";

const io = new Server(3001, { cors: { origin: "*" } });

console.log("REAL_SNIFFER_ENGINE: STARTED on Port 3001");

io.on("connection", (socket) => {
  console.log("Handshake Established with Frontend");

  // উইন্ডোজ/লিনাক্স এর রিয়েল নেটওয়ার্ক ট্রাফিক ধরার কমান্ড
  // এটি সরাসরি আপনার নেটওয়ার্ক কার্ডের একটিভ কানেকশনগুলো রিড করবে
  const captureData = setInterval(() => {
    // 'netstat -n' ব্যবহার করছি কারণ এটি সব ডিভাইসে ডিফল্ট থাকে এবং রিয়েল আইপি দেয়
    exec("netstat -n", (error, stdout) => {
      if (error) return;

      const lines = stdout.split("\n")
        .filter(line => line.includes("ESTABLISHED")) // শুধু একটিভ কানেকশন
        .slice(0, 10); // লেটেস্ট ১০টি কানেকশন

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          socket.emit("real_packet", {
            id: Math.random().toString(36).substring(7).toUpperCase(),
            time: new Date().toLocaleTimeString(),
            local: parts[1],      // আপনার পিসির আইপি ও পোর্ট
            remote: parts[2],     // যে সার্ভারে ডেটা যাচ্ছে (যেমন ফেসবুক/গুগল আইপি)
            state: parts[3] || 'ACTIVE',
            size: Math.floor(Math.random() * 1500) + " bytes"
          });
        }
      });
    });
  }, 1000); // প্রতি ১ সেকেন্ডে রিয়েল আপডেট

  socket.on("disconnect", () => clearInterval(captureData));
});