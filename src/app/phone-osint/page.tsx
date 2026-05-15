"use client";
import { useState } from 'react';
import { Search, Zap, Globe, ShieldCheck, ExternalLink, Loader2, Database, PhoneCall } from 'lucide-react';

export default function RealOSINT() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRes(null);
    try {
      const response = await fetch(`/api/phone-osint?number=${encodeURIComponent(input)}`);
      const data = await response.json();
      setRes(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={s.body}>
      <header style={s.header}>
        <div style={s.logo}><Database size={24} color="#00ff41"/></div>
        <h1 style={s.title}>REAL_TIME_OSINT_NODE_v7.0</h1>
      </header>

      <form onSubmit={handleTrace} style={s.form}>
        <input style={s.input} placeholder="Enter Target (e.g. +88017...)" value={input} onChange={(e)=>setInput(e.target.value)} />
        <button style={s.btn} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18}/> : <Zap size={18}/>} START_TRACE
        </button>
      </form>

      {res && res.real_data && (
        <div style={s.dashboard}>
          {/* Metadata Section */}
          <div style={s.card}>
            <div style={s.cardHead}><PhoneCall size={14}/> REAL_IDENTITY_METADATA</div>
            <div style={s.row}><span>CARRIER:</span> <b style={{color:'#00ff41'}}>{res.real_data.carrier}</b></div>
            <div style={s.row}><span>FORMAT:</span> <b>{res.real_data.format_intl}</b></div>
            <div style={s.row}><span>STATUS:</span> <b style={{color:'#00ff41'}}>VERIFIED_ACTIVE</b></div>
          </div>

          {/* Footprint Grid */}
          <h3 style={s.sub}>DIGITAL_FOOTPRINT_NODES</h3>
          <div style={s.grid}>
            {res.osint_footprints.map((node: any, i: number) => (
              <div key={i} style={s.node}>
                <div style={s.nodeTop}><Globe size={14} color="#00ff41"/> {node.site}</div>
                <div style={s.nodeStat}>{node.status}</div>
                <a href={node.url} target="_blank" style={s.link}>OPEN_OSINT_GATEWAY <ExternalLink size={10}/></a>
              </div>
            ))}
          </div>
        </div>
      )}
      <style jsx>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  body: { backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '30px', fontFamily: 'monospace' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #111', paddingBottom: '15px' },
  logo: { border: '1px solid #00ff41', padding: '8px' },
  title: { fontSize: '20px', letterSpacing: '1px' },
  form: { display: 'flex', gap: '10px', marginBottom: '40px' },
  input: { flex: 1, backgroundColor: '#080808', border: '1px solid #222', padding: '15px', color: '#00ff41', outline: 'none' },
  btn: { backgroundColor: '#00ff41', color: '#000', border: 'none', padding: '0 25px', fontWeight: 'bold' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  dashboard: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  card: { backgroundColor: '#080808', border: '1px solid #111', padding: '20px', borderLeft: '4px solid #00ff41' },
  cardHead: { fontSize: '11px', color: '#444', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' },
  sub: { fontSize: '12px', color: '#444', marginTop: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  node: { backgroundColor: '#050505', border: '1px solid #111', padding: '15px' },
  nodeTop: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 'bold' as const, marginBottom: '5px' },
  nodeStat: { fontSize: '10px', color: '#666', marginBottom: '15px' },
  link: { fontSize: '10px', color: '#00ff41', textDecoration: 'none', border: '1px solid #00ff41', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }
};