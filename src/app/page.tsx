"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link'; // পেজ নেভিগেশনের জন্য
import { usePathname } from 'next/navigation'; // অ্যাক্টিভ পেজ ডিটেক্ট করার জন্য
import { Shield, Zap, Globe, Search, Lock,Radar, Wifi, Code,Terminal, Eye, Cpu, Database, Bug, Clock, Calendar, Activity, Menu, X, ArrowRight, Key } from 'lucide-react';

export default function HackaBox({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // মোবাইল মেনুর জন্য

  // --- নতুন ফিচারের স্টেটসমূহ ---
  const [domain, setDomain] = useState("");
  const [resolvedIp, setResolvedIp] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const [cryptoText, setCryptoText] = useState("");
  const [cryptoKey, setCryptoKey] = useState("secret");
  const [cryptoResult, setCryptoResult] = useState("");

  // রিয়েল টাইম এবং ডেট আপডেট
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // IP Resolver Function
  const handleResolveIp = async () => {
    if (!domain) return;
    setIsResolving(true);
    setResolvedIp("Resolving target...");
    try {
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      const res = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
      const data = await res.json();
      if (data.Answer && data.Answer.length > 0) {
        setResolvedIp(data.Answer[0].data);
      } else {
        setResolvedIp("No IPv4 address found.");
      }
    } catch (err) {
      setResolvedIp("Error: Failed to resolve host.");
    } finally {
      setIsResolving(false);
    }
  };

  // XOR Encryption/Decryption Function
  const handleCrypto = (mode: 'encrypt' | 'decrypt') => {
    if (!cryptoText) return;
    if (mode === 'encrypt') {
      // String to Base64 (Simple obfuscation for dashboard theme)
      try {
        const encoded = btoa(encodeURIComponent(cryptoText));
        setCryptoResult(encoded);
      } catch (e) {
        setCryptoResult("Encryption Error");
      }
    } else {
      // Base64 to String
      try {
        const decoded = decodeURIComponent(atob(cryptoText));
        setCryptoResult(decoded);
      } catch (e) {
        setCryptoResult("Invalid Encrypted String!");
      }
    }
  };

  const tools = [
    { icon: <Zap size={20}/>, name: "Port Scanner", path: "/port-scanner" },
    { icon: <Globe size={20}/>, name: "IP Geo-Locator", path: "/ip-locator" },
    { icon: <Search size={20}/>, name: "Subdomain Finder", path: "/subdomain-finder" },
    { icon: <Lock size={20}/>, name: "Directory Fuzzer", path: "/fuzzer" },
    { icon: <Wifi size={20}/>, name: "Network Sniffer", path: "/network-sniffer" },
    { icon: <Code size={20}/>, name: "Phone OSINT", path: "/phone-osint" },
    { icon: <Eye size={20}/>, name: "Website Build Analyzer", path: "/dns-enum" },
    { icon: <Bug size={20}/>, name: "Vuln Scanner", path: "/scanner" },
    { icon: <Radar size={20}/>, name: "User Name Hunter", path: "/username-hunter" },
    { icon: <Terminal size={20}/>, name: "Website Scraper", path: "/recon-scraper" },
    { icon: <Database size={20}/>, name: "SQL Injector", path: "/sql-injector" },
    { icon: <Shield size={20}/>, name: "Image and PDF Scanner", path: "/bomb" },
  ];

  // বর্তমান মডিউল এর নাম বের করা
  const currentModule = tools.find(t => t.path === pathname)?.name || "DASHBOARD";

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#00f2ff', padding: '15px', display: 'flex', flexDirection: 'row', gap: '15px', fontFamily: 'monospace', position: 'relative', overflowX: 'hidden' }}>
      
      {/* CSS For Responsive Grid and Media Queries */}
      <style dangerouslySetInnerHTML={{__html: `
        /* ডেস্কটপে মোবাইল মেনু বাটন এবং ক্লোজ বাটন হাইড থাকবে */
        .menu-toggle-btn, .sidebar-close-btn { display: none !important; }
        
        /* শুধুমাত্র ট্যাবলেট এবং মোবাইলে (১০২৪ পিক্সেল বা তার নিচে) রেসপন্সিভ ড্রয়ার একটিভ হবে */
        @media (max-width: 1024px) {
          .menu-toggle-btn { display: block !important; }
          .sidebar-close-btn { display: block !important; }
          
          aside { 
            position: fixed !important; 
            left: -340px !important; 
            top: 15px; 
            bottom: 15px; 
            z-index: 999; 
            transition: 0.3s ease-in-out; 
            height: calc(100vh - 30px);
          }
          
          .sidebar-open aside { 
            left: 15px !important; 
            box-shadow: 0 0 30px #0044ff !important;
          }
          
          .main-panel { width: 100% !important; }
          .card-grid { grid-template-columns: 1fr !important; }
          .top-bar-time { display: none !important; }
        }
      `}} />

      {/* Wrapper Class for handling Mobile Drawer */}
      <div className={isSidebarOpen ? "sidebar-open" : ""} style={{ display: 'flex', gap: '15px', width: '100%', minHeight: 'calc(100vh - 30px)' }}>
        
        {/* Sidebar - Tools List */}
        <aside style={{ width: '300px', backgroundColor: '#050505', border: '1px solid #0044ff', borderRadius: '10px', padding: '20px', boxShadow: '0 0 15px #002244', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #0044ff', paddingBottom: '10px' }}>
            <Link href="/" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield color="#00f2ff" size={30} />
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>HACKABOX_PRO</h1>
              </div>
            </Link>
            {/* Mobile Close Button */}
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#00f2ff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
            {tools.map((tool, i) => (
              <Link key={i} href={tool.path} onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
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
        <main className="main-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#050505', border: '1px solid #0044ff', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Top Bar */}
          <div style={{ padding: '15px', background: '#001122', borderBottom: '1px solid #0044ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* Mobile Menu Toggle Button (3-bar icon) */}
              <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: '#00f2ff', cursor: 'pointer' }}>
                <Menu size={24} />
              </button>
              <div className="top-bar-time" style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                <span><Calendar size={14} style={{marginRight: '5px', display: 'inline', verticalAlign: 'middle'}}/> {date}</span>
                <span><Clock size={14} style={{marginRight: '5px', display: 'inline', verticalAlign: 'middle'}}/> {time}</span>
              </div>
            </div>
            <span style={{ color: '#0f0', fontSize: '12px', fontWeight: 'bold' }}>● MODULE: {currentModule.toUpperCase()}</span>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* যদি ড্যাশবোর্ড পেজে থাকে তবে ডিফল্ট কন্টেন্ট দেখাবে, নাহলে চিলড্রেন (অন্য পেজ) দেখাবে */}
            {pathname === "/" ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Responsive Grid Cards */}
                <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div style={cardStyle}><Activity color="#00f2ff" style={{margin: '0 auto 10px auto'}} /> <h3>SYSTEM LOAD: 24%</h3></div>
                  <div style={cardStyle}><Clock color="#00f2ff" style={{margin: '0 auto 10px auto'}} /> <h3>UPTIME: 142H</h3></div>
                  <div style={cardStyle}><Shield color="#00f2ff" style={{margin: '0 auto 10px auto'}} /> <h3>SECURITY: ACTIVE</h3></div>
                </div>

                {/* SLOT 1: IP Address Resolver (Replacer of old skeleton) */}
                <div style={slotContainerStyle}>
                  <div style={slotHeaderStyle}><Globe size={16} color="#00f2ff" /> GET ANY DOMAIN IP</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                    <input 
                      type="text" 
                      placeholder="Enter Domain (e.g., google.com)" 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      style={inputStyle}
                    />
                    <button onClick={handleResolveIp} disabled={isResolving} style={actionButtonStyle}>
                      {isResolving ? "RESOLVING..." : "RESOLVE"} <ArrowRight size={16} />
                    </button>
                  </div>
                  {resolvedIp && (
                    <div style={outputBoxStyle}>
                      <span style={{ color: '#00ff44' }}>[+] RESOLVED IP:</span> {resolvedIp}
                    </div>
                  )}
                </div>

                {/* SLOT 2: Message Encryption & Decryption */}
                <div style={slotContainerStyle}>
                  <div style={slotHeaderStyle}><Key size={16} color="#00f2ff" /> CRYPTO MESSAGING MATRIX</div>
                  <div className="crypto-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginTop: '15px' }}>
                    <textarea 
                      placeholder="Enter plain text to encrypt OR hash string to decrypt..." 
                      value={cryptoText}
                      onChange={(e) => setCryptoText(e.target.value)}
                      style={{ ...inputStyle, height: '80px', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleCrypto('encrypt')} style={{ ...actionButtonStyle, backgroundColor: '#002244', flex: 1, justifyContent: 'center' }}>
                        ENCRYPT
                      </button>
                      <button onClick={() => handleCrypto('decrypt')} style={{ ...actionButtonStyle, backgroundColor: '#440011', borderColor: '#ff0055', color: '#ff0055', flex: 1, justifyContent: 'center' }}>
                        DECRYPT
                      </button>
                    </div>
                  </div>
                  {cryptoResult && (
                    <div style={{ ...outputBoxStyle, borderLeftColor: '#ff0055' }}>
                      <span style={{ color: '#00f2ff' }}>[=] OUTPUT RESULT:</span>
                      <p style={{ color: '#fff', wordBreak: 'break-all', marginTop: '5px', margin: 0 }}>{cryptoResult}</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
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
  borderRadius: '8px', textAlign: 'center' as const, fontSize: '12px',
  boxShadow: '0 0 10px #001122'
};

const slotContainerStyle = {
  border: '1px solid #0044ff', padding: '20px', borderRadius: '8px',
  background: '#03030b', boxShadow: '0 0 15px rgba(0, 68, 255, 0.1)'
};

const slotHeaderStyle = { 
  fontSize: '14px', fontWeight: 'bold', color: '#00f2ff', 
  borderBottom: '1px dashed #0044ff', paddingBottom: '8px',
  display: 'flex', alignItems: 'center', gap: '8px'
};

const inputStyle = {
  flex: 1, minWidth: '200px', padding: '12px', backgroundColor: '#000',
  border: '1px solid #0044ff', borderRadius: '5px', color: '#fff',
  outline: 'none', fontFamily: 'monospace', fontSize: '14px'
};

const actionButtonStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
  backgroundColor: '#001122', border: '1px solid #00f2ff', borderRadius: '5px',
  color: '#00f2ff', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace',
  transition: '0.2s'
};

const outputBoxStyle = {
  marginTop: '15px', padding: '12px', backgroundColor: '#000',
  borderLeft: '4px solid #00ff44', borderTop: '1px solid #111',
  borderRight: '1px solid #111', borderBottom: '1px solid #111',
  borderRadius: '0 5px 5px 0', fontSize: '14px', fontFamily: 'monospace'
};