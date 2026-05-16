"use client";
import { useState } from 'react';
import { Radar, Terminal, Loader2, Search, ShieldAlert, Globe, ExternalLink, CheckCircle, HelpCircle } from 'lucide-react';

interface HunterResult {
  name: string;
  url: string;
  status: 'CLAIMED' | 'AVAILABLE' | 'ERROR';
}

export default function UsernameHunter() {
  const [username, setUsername] = useState("");
  const [isHunting, setIsHunting] = useState(false);
  const [results, setResults] = useState<HunterResult[]>([]);
  const [stats, setStats] = useState({ found: 0, scanned: 0 });
  const [error, setError] = useState<string | null>(null);

  const launchUsernameHunt = async () => {
    if (!username) return;
    setIsHunting(true);
    setError(null);
    setResults([]);
    setStats({ found: 0, scanned: 0 });

    try {
      // রিয়েল-টাইম স্ট্রিম রিডার দিয়ে ব্যাকএন্ডের ইভেন্ট সোর্স কানেক্ট করা
      const response = await fetch(`/api/username-hunter?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) throw new Error("OSINT Uplink Failed.");
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ""; // অবশিষ্টাংশ বাফারে রাখা

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.replace('data: ', '').trim();
            try {
              const parsed: HunterResult = JSON.parse(rawData);
              
              setResults((prev) => {
                // ডুপ্লিকেট এভয়েড করার মেকানিজম
                if (prev.some(r => r.name === parsed.name)) return prev;
                return [...prev, parsed];
              });

              setStats((prev) => ({
                scanned: prev.scanned + 1,
                found: parsed.status === 'CLAIMED' ? prev.found + 1 : prev.found
              }));
            } catch (e) {
              // পার্সিং এরর ইগনোর করা
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Target footprint lookup dropped.");
    } finally {
      setIsHunting(false);
    }
  };

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{__html: `
        .hunter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card-node {
          background-color: #050505;
          border: 1px solid #111;
          border-radius: 6px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          transition: all 0.2s ease;
        }
        .card-claimed { border-color: #ff0055 !important; boxShadow: 0 0 10px rgba(255, 0, 85, 0.05); }
        .card-available { border-color: #00ff44 !important; opacity: 0.6; }
      `}} />

      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Radar color="#00f2ff" size={28} className={isHunting ? "animate-pulse" : ""} />
          <h1 style={titleStyle}>OSINT_USERNAME_HUNTER_V5</h1>
        </div>
        <p style={subtitleStyle}>Asynchronous deep-web footprinting engine querying cross-platform routing logs for identity matching.</p>
      </div>

      {/* Control Module Input */}
      <div style={inputContainerStyle}>
        <div style={{ position: 'relative', flex: '1 1 400px' }}>
          <span style={{ position: 'absolute', left: '15px', top: '16px', color: '#333', fontSize: '15px' }}>@</span>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="target_username (e.g. joy_dev)" 
            style={inputStyle}
            disabled={isHunting}
          />
        </div>
        <button 
          onClick={launchUsernameHunt} 
          disabled={isHunting || !username}
          style={{ ...huntButtonStyle, opacity: isHunting || !username ? 0.6 : 1 }}
        >
          {isHunting ? <Loader2 className="animate-spin" size={18} /> : <Search size={16} />}
          {isHunting ? "HUNTING TARGET..." : "INITIALIZE SCAN"}
        </button>
      </div>

      {/* Stats Dashboard Row */}
      {(isHunting || results.length > 0) && (
        <div style={statsRowStyle}>
          <div style={statBoxStyle}>TOTAL SCANNED: <strong style={{color: '#fff'}}>{stats.scanned}</strong></div>
          <div style={statBoxStyle}>MATCHES FOUND: <strong style={{color: '#ff0055'}}>{stats.found}</strong></div>
          {isHunting && <div style={{ fontSize: '12px', color: '#00f2ff', display: 'flex', alignItems: 'center', gap: '8px' }}><Loader2 className="animate-spin" size={14} /> PIPELINE STREAMING...</div>}
        </div>
      )}

      {/* Main Results Board */}
      <div style={{ minHeight: '300px', marginTop: '20px' }}>
        {results.length === 0 && !isHunting && !error && (
          <div style={emptyStateStyle}>
            <Globe size={45} color="#111" />
            <p style={{ marginTop: '10px', fontSize: '13px' }}>[ OSINT SATELLITE RADAR OFFLINE: AWAITING IDENTIFIER TARGET ]</p>
          </div>
        )}

        {error && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', borderLeft: '4px solid #ff0055', background: '#1a0005', padding: '15px', color: '#ff0055', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        {/* Dynamic Cards Grid Output */}
        <div className="hunter-grid">
          {results.map((node, i) => (
            <div key={i} className={`card-node ${node.status === 'CLAIMED' ? 'card-claimed' : node.status === 'AVAILABLE' ? 'card-available' : ''}`}>
              <div>
                <span style={{ color: '#fff', fontWeight: 'bold', display: 'block' }}>{node.name}</span>
                <span style={{ fontSize: '11px', color: node.status === 'CLAIMED' ? '#ff0055' : node.status === 'AVAILABLE' ? '#00ff44' : '#444' }}>
                  {node.status === 'CLAIMED' ? '[✓] PROFILE DETECTED' : node.status === 'AVAILABLE' ? '[+] AVAILABLE' : '[-] TIMEOUT'}
                </span>
              </div>

              {node.status === 'CLAIMED' ? (
                <a href={node.url} target="_blank" rel="noreferrer" style={linkIconStyle} title="Open Live Profile">
                  <ExternalLink size={14} />
                </a>
              ) : (
                <HelpCircle size={14} color="#111" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = { backgroundColor: '#000', minHeight: '100vh', padding: '40px 20px', color: '#00f2ff', fontFamily: 'monospace', boxSizing: 'border-box' };
const headerSectionStyle = { maxWidth: '1200px', margin: '0 auto 40px auto', borderLeft: '4px solid #0044ff', paddingLeft: '20px' };
const titleStyle = { fontSize: 'clamp(18px, 5vw, 24px)', letterSpacing: '2px', margin: 0, color: '#fff' };
const subtitleStyle = { color: '#666', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' };
const inputContainerStyle: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto 20px auto', display: 'flex', flexWrap: 'wrap', gap: '10px' };
const inputStyle = { width: '100%', backgroundColor: '#050505', border: '1px solid #0044ff', padding: '15px 15px 15px 35px', color: '#fff', fontSize: '15px', outline: 'none', borderRadius: '5px', fontFamily: 'monospace' };
const huntButtonStyle = { flex: '1 1 180px', backgroundColor: '#0044ff', color: '#fff', border: 'none', padding: '15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as const, display: 'flex', alignItems: 'center', justifyRules: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'monospace' };
const statsRowStyle = { maxWidth: '1200px', margin: '0 auto 25px auto', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' as const };
const statBoxStyle = { background: '#050505', border: '1px solid #111', padding: '8px 15px', borderRadius: '4px', fontSize: '12px', color: '#666' };
const linkIconStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: '#1a0005', color: '#ff0055', borderRadius: '4px', border: '1px solid #ff0055' };
const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '100px 0', opacity: 0.4, width: '100%' };