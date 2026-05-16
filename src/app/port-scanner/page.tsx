"use client";
import { useState } from 'react';
import { Zap, ShieldCheck, ShieldAlert, Info, Loader2, Search, Terminal, Globe } from 'lucide-react';

export default function PortScanner() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [resolvedHost, setResolvedHost] = useState("");
  const [error, setError] = useState<string | null>(null);

  // রিয়েল ব্যাকএন্ড এপিআই হিট করার ফাংশন
  const executeLiveScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setError(null);
    setResults([]);
    setResolvedHost("");

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to establish handshake.");
      }

      setResults(data.results);
      setResolvedHost(data.host);
    } catch (err: any) {
      setError(err.message || "Target server was unreachable.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{__html: `
        .responsive-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 2fr;
          gap: 15px;
          padding: 15px 20px;
          border-bottom: 1px solid #111;
          align-items: center;
        }
        @media (max-width: 680px) {
          .responsive-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px;
          }
          .hide-on-mobile { display: none !important; }
        }
      `}} />

      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Terminal color="#00f2ff" size={28} />
          <h1 style={titleStyle}>OSINT LIVE PORT SCANNER</h1>
        </div>
        <p style={subtitleStyle}>Advanced TCP socket interception module running asynchronous concurrent connection streams.</p>
      </div>

      {/* Input Box */}
      <div style={inputContainerStyle}>
        <input 
          type="text" 
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter IP or Domain (e.g. google.com)" 
          style={inputStyle}
          disabled={isScanning}
        />
        <button 
          onClick={executeLiveScan} 
          disabled={isScanning}
          style={{ ...scanButtonStyle, opacity: isScanning ? 0.6 : 1 }}
        >
          {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
          {isScanning ? "SOCKET INTERCEPTING..." : "START SCAN"}
        </button>
      </div>

      {/* Advanced Result Table */}
      <div style={tableWrapperStyle}>
        
        {/* Network Target Badge */}
        {resolvedHost && (
          <div style={{ padding: '12px 20px', background: '#001122', borderBottom: '1px solid #0044ff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={14} color="#00ff44" /> <span>TARGET STACK RESOLVED: <strong style={{color: '#fff'}}>{resolvedHost}</strong></span>
          </div>
        )}

        <div className="responsive-grid" style={{ backgroundColor: '#0a0a0a', borderBottom: '2px solid #0044ff', fontSize: '11px', color: '#444', fontWeight: 'bold' }}>
          <span>PORT / PROTOCOL</span>
          <span>STATE STATUS</span>
          <span className="hide-on-mobile">PAYLOAD BRIEF INFO</span>
        </div>

        <div style={{ minHeight: '350px', position: 'relative' }}>
          {results.length === 0 && !isScanning && !error && (
            <div style={emptyStateStyle}>
              <Search size={50} color="#111" />
              <p style={{ marginTop: '10px', fontSize: '13px' }}>[ MONITOR STANDBY: READY TO SCAN ]</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '40px 20px', color: '#ff0055', textAlign: 'center', fontSize: '14px' }}>
              [-] Error: {error}
            </div>
          )}

          {results.map((res, i) => (
            <div key={i} className="responsive-grid">
              <div style={cellMainStyle}>
                <span style={portStyle}>{res.port}</span>
                <span style={serviceStyle}>[{res.service}]</span>
              </div>
              
              <div>
                {res.status === 'open' ? (
                  <span style={statusOpenStyle}><ShieldCheck size={14} /> OPEN</span>
                ) : (
                  <span style={statusClosedStyle}><ShieldAlert size={14} /> FILTERED</span>
                )}
              </div>

              <div className="hide-on-mobile" style={infoCellStyle}>
                <Info size={13} color="#333" />
                <span>{res.info}</span>
              </div>
            </div>
          ))}
          
          {isScanning && (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#00f2ff', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <Loader2 className="animate-spin" size={30} color="#0044ff" />
              <span>[!] TCP HANDSHAKE IN PROGRESS... EXTRACTING SOCKET DATA...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  minHeight: '100vh',
  padding: '40px 20px',
  color: '#00f2ff',
  fontFamily: 'monospace',
  boxSizing: 'border-box'
};

const headerSectionStyle = {
  maxWidth: '900px',
  margin: '0 auto 40px auto',
  borderLeft: '4px solid #0044ff',
  paddingLeft: '20px'
};

const titleStyle = { fontSize: 'clamp(18px, 5vw, 24px)', letterSpacing: '2px', margin: 0, color: '#fff' };
const subtitleStyle = { color: '#666', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' };

const inputContainerStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto 30px auto',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '10px'
};

const inputStyle = {
  flex: '1 1 300px',
  backgroundColor: '#050505',
  border: '1px solid #0044ff',
  padding: '15px',
  color: '#fff',
  fontSize: '15px',
  outline: 'none',
  borderRadius: '5px',
  fontFamily: 'monospace'
};

const scanButtonStyle = {
  flex: '1 1 200px',
  backgroundColor: '#0044ff',
  color: '#fff',
  border: 'none',
  padding: '15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  fontFamily: 'monospace'
};

const tableWrapperStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  backgroundColor: '#050505',
  border: '1px solid #0044ff',
  borderRadius: '8px',
  boxShadow: '0 0 20px rgba(0, 68, 255, 0.05)',
  overflow: 'hidden'
};

const cellMainStyle = { display: 'flex', alignItems: 'center', gap: '8px' };
const portStyle = { color: '#fff', fontWeight: 'bold', fontSize: '15px' };
const serviceStyle = { fontSize: '11px', color: '#0044ff', fontWeight: 'bold' };
const statusOpenStyle = { color: '#00ff44', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' };
const statusClosedStyle = { color: '#ff0055', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' };
const infoCellStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' };
const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '120px 0', opacity: 0.4 };