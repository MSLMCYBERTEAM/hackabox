"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link'; // পেজ নেভিগেশনের জন্য
import { usePathname } from 'next/navigation'; // অ্যাক্টিভ পেজ ডিটেক্ট করার জন্য
import { Shield, Zap, Globe, Search, Lock, Wifi, Code, Eye, Cpu, Database, Bug, Clock, Calendar, Activity } from 'lucide-react';

export default function HackaBox({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // রিয়েল টাইম এবং ডেট আপডেট
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tools = [
    { icon: <Zap size={20}/>, name: "Port Scanner", path: "/port-scanner" },
    { icon: <Globe size={20}/>, name: "IP Geo-Locator", path: "/ip-locator" },
    { icon: <Search size={20}/>, name: "Subdomain Finder", path: "/subdomain-finder" },
    { icon: <Lock size={20}/>, name: "Directory Fuzzer", path: "/fuzzer" },
    { icon: <Wifi size={20}/>, name: "Network Sniffer", path: "/network-sniffer" },
    { icon: <Code size={20}/>, name: "Phone OSINT", path: "/phone-osint" },
    { icon: <Eye size={20}/>, name: "Website Build Analyzer", path: "/dns-enum" },
    { icon: <Bug size={20}/>, name: "Vuln Scanner", path: "/scanner" },
    { icon: <Database size={20}/>, name: "SQL Injector", path: "/sql-injector" },
    { icon: <Shield size={20}/>, name: "SMS Bomber", path: "/bomb" },
  ];

  // বর্তমান মডিউল এর নাম বের করা
  const currentModule = tools.find(t => t.path === pathname)?.name || "DASHBOARD";

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#00f2ff', padding: '15px', display: 'flex', gap: '15px', fontFamily: 'monospace' }}>
      
      {/* Sidebar - Tools List */}
      <aside style={{ width: '300px', backgroundColor: '#050505', border: '1px solid #0044ff', borderRadius: '10px', padding: '20px', boxShadow: '0 0 15px #002244' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #0044ff', paddingBottom: '10px' }}>
            <Shield color="#00f2ff" size={30} />
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>HACKABOX_PRO</h1>
          </div>
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tools.map((tool, i) => (
            <Link key={i} href={tool.path} style={{ textDecoration: 'none' }}>
              <button 
                style={{ 
                  ...buttonStyle, 
                  width: '100%',
                  borderColor: pathname === tool.path ? '#00f2ff' : '#111',
                  backgroundColor: pathname === tool.path ? '#001122' : 'transparent'
                }}
              >
                {tool.icon}
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{tool.name}</span>
              </button>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#050505', border: '1px solid #0044ff', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Top Bar */}
        <div style={{ padding: '15px', background: '#001122', borderBottom: '1px solid #0044ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            <span><Calendar size={14} style={{marginRight: '5px'}}/> {date}</span>
            <span><Clock size={14} style={{marginRight: '5px'}}/> {time}</span>
          </div>
          <span style={{ color: '#0f0', fontSize: '12px' }}>● MODULE: {currentModule.toUpperCase()}</span>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* যদি ড্যাশবোর্ড পেজে থাকে তবে ডিফল্ট কন্টেন্ট দেখাবে, নাহলে চিলড্রেন (অন্য পেজ) দেখাবে */}
          {pathname === "/" ? (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={cardStyle}><Activity color="#00f2ff" /> <h3>SYSTEM LOAD: 24%</h3></div>
                <div style={cardStyle}><Clock color="#00f2ff" /> <h3>UPTIME: 142H</h3></div>
                <div style={cardStyle}><Shield color="#00f2ff" /> <h3>SECURITY: ACTIVE</h3></div>
              </div>
              <div style={skeletonContainer}>
                <div style={skeletonHeader}>SYSTEM MONITOR SKELETON</div>
                <div style={skeletonLine}></div>
                <div style={skeletonLine}></div>
                <div style={{...skeletonLine, width: '60%'}}></div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

// --- স্টাইলস ---
const buttonStyle = {
  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', 
  background: 'transparent', border: '1px solid #111', borderRadius: '5px', 
  color: '#fff', textAlign: 'left' as const, cursor: 'pointer', transition: '0.3s'
};

const cardStyle = {
  background: '#0a0a0a', border: '1px solid #0044ff', padding: '20px', 
  borderRadius: '8px', textAlign: 'center' as const, fontSize: '12px'
};

const skeletonContainer = {
  border: '1px dashed #0044ff', padding: '20px', borderRadius: '8px', opacity: 0.6
};

const skeletonHeader = { fontSize: '10px', marginBottom: '15px', color: '#0044ff' };

const skeletonLine = { height: '10px', background: '#0044ff', marginBottom: '10px', width: '100%' };