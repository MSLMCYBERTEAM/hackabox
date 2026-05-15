"use client";
import { useState } from 'react';
import { ShieldAlert, Search, Terminal, AlertTriangle, ShieldCheck, Loader2, Zap, Code, Target } from 'lucide-react';

export default function VunScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      // এপিআই কল করা হচ্ছে যা রিয়েল-টাইম ডাটা আনবে
      const res = await fetch(`/api/scanner?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) { 
      console.error("Scan failed"); 
    }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <div style={s.content}>
        <header style={s.header}>
          <ShieldAlert size={40} color="#ff003c" />
          <h1 style={s.title}>VULNERABILITY_SCANNER_v2.0</h1>
          {results?.scanTime && <span style={s.scanTime}>SCAN_TIME: {results.scanTime}</span>}
        </header>

        <form onSubmit={startScan} style={s.inputGroup}>
          <input 
            style={s.input} 
            placeholder="Enter target (e.g. testphp.vulnweb.com)" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button style={s.btn} disabled={loading}>
            {loading ? <Loader2 className="spin" /> : <Zap size={18} />} INITIATE_ATTACK
          </button>
        </form>

        {results?.success && (
          <div style={s.reportGrid}>
            {results.findings.map((item: any, i: number) => (
              <div key={i} style={{
                ...s.card, 
                borderColor: item.severity === 'Critical' || item.severity === 'High' ? '#ff003c' : '#333',
                borderLeft: `4px solid ${item.severity === 'Critical' ? '#ff003c' : '#ffcc00'}`
              }}>
                <div style={s.cardTop}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <AlertTriangle size={18} color={item.severity === 'Critical' ? '#ff003c' : '#ffcc00'} />
                    <h3 style={s.vulnType}>{item.type}</h3>
                  </div>
                  <span style={{...s.severityBadge, color: item.severity === 'Critical' ? '#ff003c' : '#ffcc00'}}>
                    {item.severity}
                  </span>
                </div>
                
                <p style={s.detail}>{item.detail}</p>

                {/* হ্যাকারদের জন্য নতুন এ্যাকশনেবল সেকশন */}
                {item.exploit && (
                  <div style={s.exploitSection}>
                    <div style={s.sectionHeader}>
                      <Target size={14} color="#00ff41" />
                      <span style={{color: '#00ff41', fontSize: '11px'}}>EXPLOIT_STRATEGY</span>
                    </div>
                    <p style={s.exploitText}>{item.exploit}</p>
                    
                    <div style={s.sectionHeader}>
                      <Code size={14} color="#00ff41" />
                      <span style={{color: '#00ff41', fontSize: '11px'}}>ATTACK_PAYLOAD</span>
                    </div>
                    <div style={s.payloadBox}>
                      <code>{item.payload}</code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        code { font-family: 'Courier New', monospace; font-size: 11px; }
      `}</style>
    </div>
  );
}

const s = {
  container: { backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '40px 20px', fontFamily: 'monospace' },
  content: { maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #111', paddingBottom: '20px', position: 'relative' as const },
  title: { fontSize: '22px', letterSpacing: '2px', textTransform: 'uppercase' as const },
  scanTime: { position: 'absolute' as const, right: 0, fontSize: '12px', color: '#444' },
  inputGroup: { display: 'flex', gap: '10px', marginBottom: '40px' },
  input: { flex: 1, backgroundColor: '#050505', border: '1px solid #222', padding: '15px', color: '#00ff41', outline: 'none' },
  btn: { backgroundColor: '#ff003c', color: '#fff', border: 'none', padding: '0 30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s' },
  reportGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#080808', border: '1px solid #111', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column' as const },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  severityBadge: { fontSize: '10px', fontWeight: 'bold', backgroundColor: '#111', padding: '2px 8px', borderRadius: '4px', border: '1px solid #222' },
  vulnType: { fontSize: '16px', color: '#fff', margin: 0 },
  detail: { fontSize: '13px', color: '#888', lineHeight: '1.4', marginBottom: '15px' },
  
  // নতুন হ্যাকিং সেকশন স্টাইল
  exploitSection: { marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #1a1a1a' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' },
  exploitText: { fontSize: '12px', color: '#bbb', marginBottom: '12px', fontStyle: 'italic' },
  payloadBox: { backgroundColor: '#000', border: '1px solid #1a1a1a', padding: '10px', color: '#00ff41', overflowX: 'auto' as const, borderRadius: '2px' }
};