"use client";
import { useState } from 'react';
import { Search, Cpu, Globe, Zap, ShieldCheck, Box } from 'lucide-react';

export default function TechProfiler() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const profileSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/tech-stack?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Profiling failed");
    }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <div style={s.content}>
        <header style={s.header}>
          <Cpu size={40} color="#00ff41" />
          <h1 style={s.title}>TECH_STACK_PROFILER_v2</h1>
        </header>

        <form onSubmit={profileSite} style={s.searchBox}>
          <input 
            style={s.input} 
            placeholder="Enter target domain (e.g. google.com)" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button style={s.btn} disabled={loading}>
            {loading ? <Zap className="spin" /> : <Search />} SCAN_STACK
          </button>
        </form>

        {results?.success && (
          <div style={s.grid}>
            {results.stack.map((item: any, i: number) => (
              <div key={i} style={s.card}>
                <Box size={20} color="#00ff41" />
                <div>
                  <div style={s.cardCat}>{item.category}</div>
                  <div style={s.cardName}>{item.name}</div>
                </div>
                <ShieldCheck size={16} style={{marginLeft: 'auto'}} color="#555" />
              </div>
            ))}
          </div>
        )}

        {results?.success === false && <div style={s.error}>SCAN_FAILED: TARGET_UNREACHABLE</div>}
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  container: { backgroundColor: '#000', minHeight: '100vh', color: '#00ff41', padding: '40px 20px', fontFamily: 'monospace' },
  content: { maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', borderBottom: '1px solid #111', paddingBottom: '20px' },
  title: { fontSize: '24px', letterSpacing: '2px', color: '#fff' },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '40px' },
  input: { flex: 1, backgroundColor: '#050505', border: '1px solid #222', padding: '15px', color: '#fff', outline: 'none' },
  btn: { backgroundColor: '#00ff41', color: '#000', border: 'none', padding: '0 30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#050505', border: '1px solid #111', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '4px' },
  cardCat: { fontSize: '10px', color: '#555', textTransform: 'uppercase' as const },
  cardName: { fontSize: '18px', color: '#fff', fontWeight: 'bold' as const },
  error: { textAlign: 'center' as const, color: '#ff003c', padding: '20px', border: '1px dashed #ff003c' }
};