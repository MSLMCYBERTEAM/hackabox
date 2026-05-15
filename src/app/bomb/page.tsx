"use client";
import { useState } from 'react';
import { Zap, Send, Loader2, Terminal, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';

export default function BombDashboard() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{msg: string, type: 'success' | 'warn'}[]>([]);

  const addLog = (msg: string, type: 'success' | 'warn' = 'success') => {
    setLogs(prev => [{ msg, type }, ...prev].slice(0, 10));
  };

  const executePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (target.length < 11) return alert("Enter a valid BD number!");

    setLoading(true);
    addLog(`Target Locked: ${target}`, 'success');

    try {
      const res = await fetch('/api/bomb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: target }),
      });
      
      const data = await res.json();

      if (data.success) {
        addLog(`MULTI_NODE: Sequence Delivered to ${data.nodes} Units`, 'success');
      } else {
        addLog(`SEQUENCE_ERR: All Nodes are in Cooldown`, 'warn');
      }
    } catch (err) {
      addLog(`CRITICAL: System Connection Interrupted`, 'warn');
    }
    setLoading(false);
  };

  return (
    <div style={s.body}>
      <div style={s.wrapper}>
        <header style={s.header}>
          <div style={s.logo}><Zap size={28} color="#00ff41" fill="#00ff41"/></div>
          <div>
            <h1 style={s.title}>SMS_STRESSER_V4_MULTI</h1>
            <p style={s.status}>ACTIVE_NODES: STEADYFAST, SHIKHO // STATUS: OPTIMIZED</p>
          </div>
        </header>

        <div style={s.card}>
          <div style={s.cardLabel}><Smartphone size={14}/> INJECT_TARGET_NUMBER</div>
          <form onSubmit={executePayload} style={s.inputArea}>
            <input 
              style={s.input} 
              placeholder="01xxxxxxxxx" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <button style={s.fireBtn} disabled={loading}>
              {loading ? <Loader2 className="spin" size={20}/> : <Send size={20}/>}
              FIRE_STRESS_TEST
            </button>
          </form>
        </div>

        <div style={s.terminal}>
          <div style={s.termHead}><Terminal size={14}/> SYSTEM_LOG_STREAM</div>
          <div style={s.logList}>
            {logs.length === 0 && <div style={s.empty}>System Ready. Deploy payload to start logs...</div>}
            {logs.map((log, i) => (
              <div key={i} style={log.type === 'success' ? s.logSuccess : s.logWarn}>
                {log.type === 'success' ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                <span>{`[${new Date().toLocaleTimeString()}] ${log.msg}`}</span>
              </div>
            ))}
          </div>
        </div>
        <footer style={s.footer}>EDUCATIONAL_PURPOSE_ONLY // DEV: RABBY_HASAN_JOY</footer>
      </div>
      <style jsx>{`.spin { animation: rotate 1s linear infinite; } @keyframes rotate { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// আপনার দেওয়া 's' অবজেক্টের স্টাইলগুলো এখানে হুবহু থাকবে...
const s = {
  body: { backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '30px', fontFamily: 'monospace' },
  wrapper: { maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #111', paddingBottom: '20px', marginBottom: '30px' },
  logo: { border: '2px solid #00ff41', padding: '10px', borderRadius: '4px', boxShadow: '0 0 15px rgba(0,255,65,0.3)' },
  title: { fontSize: '22px', margin: 0, letterSpacing: '2px', color: '#00ff41' },
  status: { fontSize: '10px', color: '#444', marginTop: '5px' },
  card: { backgroundColor: '#080808', border: '1px solid #1a1a1a', padding: '25px', borderRadius: '8px', marginBottom: '20px' },
  cardLabel: { fontSize: '11px', color: '#666', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  inputArea: { display: 'flex', gap: '15px' },
  input: { flex: 1, backgroundColor: '#000', border: '1px solid #333', padding: '15px', color: '#00ff41', outline: 'none', fontSize: '16px', borderRadius: '4px' },
  fireBtn: { backgroundColor: '#00ff41', color: '#000', border: 'none', padding: '0 30px', fontWeight: 'bold' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px' },
  terminal: { backgroundColor: '#050505', border: '1px solid #111', borderRadius: '4px' },
  termHead: { backgroundColor: '#0d0d0d', padding: '12px 20px', fontSize: '12px', color: '#555', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', gap: '10px' },
  logList: { padding: '20px', minHeight: '220px' },
  empty: { color: '#222', textAlign: 'center' as const, marginTop: '80px', fontSize: '12px' },
  logSuccess: { color: '#00ff41', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  logWarn: { color: '#ff003c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  footer: { textAlign: 'center' as const, fontSize: '10px', color: '#222', marginTop: '40px' }
};