"use client";
import { useState } from 'react';
import { Search, Globe, ShieldCheck, Zap, Copy, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

export default function SubdomainFinder() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const findSubdomains = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // HackerTarget API ব্যবহার করছি যা রিয়েল ডেটা দেয়
      const response = await fetch(`https://api.hackertarget.com/hostsearch/?q=${domain}`);
      const data = await response.text();

      if (data.includes("error") || data.includes("invalid")) {
        throw new Error("Invalid domain or API limit reached.");
      }

      // ডেটা পার্সিং (API থেকে "subdomain,ip" ফরমেটে ডেটা আসে)
      const lines = data.split('\n');
      const subdomains = lines
        .map(line => line.split(',')[0])
        .filter(sub => sub.length > 0);

      setResults(subdomains);
    } catch (err) {
      setError("ডোমেইনটি খুঁজে পাওয়া যায়নি অথবা এপিআই লিমিট শেষ। সঠিক ডোমেইন (যেমন: google.com) দিন।");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Subdomain copied!');
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        {/* Header */}
        <header style={headerStyle}>
          <div style={iconBox}><Globe size={32} color="#00ff41" /></div>
          <h1 style={titleStyle}>SUBDOMAIN_RECON_v2</h1>
          <p style={subtitleStyle}>ENTER TARGET DOMAIN TO FETCH REAL-TIME ENTRIES</p>
        </header>

        {/* Search Bar */}
        <form onSubmit={findSubdomains} style={searchContainer}>
          <div style={inputWrapper}>
            <Search size={20} style={searchIcon} />
            <input 
              type="text" 
              placeholder="e.g. facebook.com, github.com" 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : "START DISCOVERY"}
          </button>
        </form>

        {/* Stats Summary */}
        {results.length > 0 && (
          <div style={statsContainer}>
            <div style={statItem}>
              <Zap size={16} /> <span>TOTAL FOUND: {results.length}</span>
            </div>
            <div style={statItem}>
              <ShieldCheck size={16} /> <span>STATUS: VERIFIED</span>
            </div>
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div style={errorStyle}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Result Table */}
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>SUBDOMAIN_URL</th>
                <th style={{...thStyle, textAlign: 'right'}}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} style={emptyStyle}>NO ACTIVE TARGET DATA AVAILABLE</td>
                </tr>
              )}
              
              {results.map((sub, index) => (
                <tr key={index} style={rowStyle}>
                  <td style={tdIndex}>{index + 1}</td>
                  <td style={tdSub}>{sub}</td>
                  <td style={tdAction}>
                    <button onClick={() => copyToClipboard(sub)} style={actionBtn} title="Copy">
                      <Copy size={14} />
                    </button>
                    <a href={`http://${sub}`} target="_blank" style={actionBtn} title="Visit">
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// --- Styles (Responsive Cyber-Dark) ---
const containerStyle: React.CSSProperties = {
  backgroundColor: '#050505',
  minHeight: '100vh',
  color: '#00ff41',
  fontFamily: 'monospace',
  padding: '40px 20px'
};

const contentWrapper: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto'
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '40px'
};

const iconBox = {
  marginBottom: '10px',
  display: 'flex',
  justifyContent: 'center'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '3px',
  color: '#fff',
  margin: 0
};

const subtitleStyle = {
  fontSize: '10px',
  color: '#00ff4188',
  marginTop: '5px'
};

const searchContainer: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginBottom: '30px'
};

const inputWrapper = {
  flex: 1,
  minWidth: '280px',
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center'
};

const searchIcon = {
  position: 'absolute' as const,
  left: '15px',
  color: '#00ff4188'
};

const inputStyle = {
  width: '100%',
  backgroundColor: '#000',
  border: '1px solid #00ff4133',
  padding: '15px 15px 15px 45px',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '14px',
  outline: 'none'
};

const buttonStyle = {
  backgroundColor: '#00ff41',
  color: '#000',
  border: 'none',
  padding: '0 30px',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
  minHeight: '50px'
};

const statsContainer = {
  display: 'flex',
  gap: '20px',
  marginBottom: '15px',
  fontSize: '11px',
  fontWeight: 'bold' as const
};

const statItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: '#00ff4111',
  padding: '5px 12px',
  borderRadius: '20px',
  border: '1px solid #00ff4133'
};

const errorStyle = {
  backgroundColor: '#ff000011',
  color: '#ff0000',
  padding: '15px',
  borderRadius: '4px',
  marginBottom: '20px',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  border: '1px solid #ff000033'
};

const tableWrapper = {
  backgroundColor: '#000',
  border: '1px solid #111',
  borderRadius: '8px',
  overflow: 'hidden'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse'
};

const tableHeadRow = {
  borderBottom: '1px solid #111',
  backgroundColor: '#080808'
};

const thStyle = {
  padding: '15px 20px',
  textAlign: 'left' as const,
  fontSize: '12px',
  color: '#444'
};

const rowStyle = {
  borderBottom: '1px solid #0a0a0a'
};

const tdIndex = {
  padding: '12px 20px',
  color: '#222',
  fontSize: '12px'
};

const tdSub = {
  padding: '12px 20px',
  color: '#fff',
  fontSize: '14px'
};

const tdAction = {
  padding: '12px 20px',
  textAlign: 'right' as const
};

const actionBtn = {
  backgroundColor: 'transparent',
  border: '1px solid #111',
  color: '#00ff4188',
  padding: '6px',
  marginLeft: '5px',
  cursor: 'pointer',
  borderRadius: '4px'
};

const emptyStyle = {
  padding: '100px 0',
  textAlign: 'center' as const,
  color: '#111',
  fontSize: '14px',
  letterSpacing: '2px'
};