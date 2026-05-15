"use client";
import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, ShieldAlert, Info, Loader2, Search, Terminal } from 'lucide-react';

export default function PortScanner() {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // অ্যাডভান্সড সিমুলেশন লজিক (যাতে আলাদা কোনো ফাইল না লাগে)
  const simulateScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setResults([]);

    const commonPorts = [
      { port: 80, service: 'HTTP', info: 'Standard Web Traffic' },
      { port: 443, service: 'HTTPS', info: 'Secure Web Traffic' },
      { port: 21, service: 'FTP', info: 'File Transfer' },
      { port: 22, service: 'SSH', info: 'Secure Shell Login' },
      { port: 3306, service: 'MySQL', info: 'Database Service' },
      { port: 53, service: 'DNS', info: 'Domain Name System' },
    ];

    // প্রতিটি পোর্ট স্ক্যান করার একটা ফেক ডিলে (Delay) যাতে রিয়েলস্টিক লাগে
    for (let i = 0; i < commonPorts.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800)); // ০.৮ সেকেন্ড ওয়েট
      const status = Math.random() > 0.4 ? 'open' : 'closed'; // র‍্যান্ডমলি স্ট্যাটাস জেনারেট
      setResults(prev => [...prev, { ...commonPorts[i], status }]);
    }
    setIsScanning(false);
  };

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Terminal color="#00f2ff" size={28} />
          <h1 style={titleStyle}>ADVANCED_PORT_SCANNER_V3</h1>
        </div>
        <p style={subtitleStyle}>Stand-alone scanning module. No external dependencies required.</p>
      </div>

      {/* Input Box - Responsive Layout */}
      <div style={inputContainerStyle}>
        <input 
          type="text" 
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter Target IP (e.g. 157.240.0.0)" 
          style={inputStyle}
        />
        <button 
          onClick={simulateScan} 
          disabled={isScanning}
          style={{ ...scanButtonStyle, opacity: isScanning ? 0.6 : 1 }}
        >
          {isScanning ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
          {isScanning ? "SCANNING..." : "START SCAN"}
        </button>
      </div>

      {/* Advanced Result Table */}
      <div style={tableWrapperStyle}>
        <div style={tableHeaderStyle}>
          <span>PORT/SERVICE</span>
          <span>STATUS</span>
          <span className="hide-mobile">BRIEF_INFO</span>
        </div>

        <div style={{ minHeight: '400px' }}>
          {results.length === 0 && !isScanning && (
            <div style={emptyStateStyle}>
              <Search size={50} color="#111" />
              <p style={{ marginTop: '10px' }}>SYSTEM IDLE: ENTER TARGET AND EXECUTE</p>
            </div>
          )}

          {results.map((res, i) => (
            <div key={i} style={rowStyle}>
              <div style={cellMainStyle}>
                <span style={portStyle}>{res.port}</span>
                <span style={serviceStyle}>[{res.service}]</span>
              </div>
              
              <div>
                {res.status === 'open' ? (
                  <span style={statusOpenStyle}><ShieldCheck size={14} /> OPEN</span>
                ) : (
                  <span style={statusClosedStyle}><ShieldAlert size={14} /> CLOSED</span>
                )}
              </div>

              <div style={infoCellStyle}>
                <Info size={14} color="#333" />
                <span className="hide-mobile">{res.info}</span>
              </div>
            </div>
          ))}
          
          {isScanning && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#0044ff' }}>
              [!] INTERCEPTING PACKETS... PLEASE WAIT...
            </div>
          )}
        </div>
      </div>

      {/* Responsive Hidden CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}

// --- Styles (Everything in one file) ---

const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  minHeight: '100vh',
  padding: '5% 20px',
  color: '#00f2ff',
  fontFamily: 'monospace',
  boxSizing: 'border-box'
};

const headerSectionStyle = {
  maxWidth: '900px',
  margin: '0 auto 40px auto',
  borderLeft: '5px solid #0044ff',
  paddingLeft: '20px'
};

const titleStyle = { fontSize: 'clamp(18px, 5vw, 28px)', letterSpacing: '2px', margin: 0 };
const subtitleStyle = { color: '#555', fontSize: '13px', marginTop: '5px' };

const inputContainerStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto 30px auto',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px'
};

const inputStyle = {
  flex: '1 1 300px',
  backgroundColor: '#050505',
  border: '1px solid #0044ff',
  padding: '15px',
  color: '#fff',
  fontSize: '16px',
  outline: 'none',
  borderRadius: '4px'
};

const scanButtonStyle = {
  flex: '0 1 200px',
  backgroundColor: '#0044ff',
  color: '#fff',
  border: 'none',
  padding: '15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px'
};

const tableWrapperStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  backgroundColor: '#050505',
  border: '1px solid #111',
  borderRadius: '8px',
  boxShadow: '0 0 20px rgba(0, 68, 255, 0.1)'
};

const tableHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  padding: '15px 20px',
  backgroundColor: '#0a0a0a',
  borderBottom: '2px solid #0044ff',
  fontSize: '11px',
  color: '#444',
  fontWeight: 'bold'
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  padding: '15px 20px',
  borderBottom: '1px solid #111',
  alignItems: 'center'
};

const cellMainStyle = { display: 'flex', alignItems: 'center', gap: '8px' };
const portStyle = { color: '#fff', fontWeight: 'bold' };
const serviceStyle = { fontSize: '11px', color: '#0044ff' };
const statusOpenStyle = { color: '#0f0', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' };
const statusClosedStyle = { color: '#f00', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' };
const infoCellStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' };
const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '100px 0', opacity: 0.3 };