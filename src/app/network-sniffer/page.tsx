"use client";
import { useState, useEffect, useCallback } from 'react';
import { Play, Square, Activity, ShieldAlert, Globe, Radio } from 'lucide-react';

export default function DeepPacketInterceptorV12() {
  const [isSniffing, setIsSniffing] = useState(false);
  const [packets, setPackets] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, secure: 0, threats: 0 });

  const logRealPacket = useCallback((url: string, type: string, extra = {}) => {
    try {
      const urlObj = new URL(url);
      const newPacket = {
        id: Math.random().toString(36).substring(2, 10).toUpperCase(),
        time: new Date().toLocaleTimeString(),
        destination: urlObj.hostname,
        protocol: urlObj.protocol.replace(':', '').toUpperCase(),
        method: type,
        status: "ACTIVE",
        ...extra
      };

      setPackets(prev => [newPacket, ...prev].slice(0, 150));
      setStats(prev => ({
        total: prev.total + 1,
        secure: prev.secure + (url.startsWith('https') ? 1 : 0),
        threats: prev.threats + (url.includes('google-analytics') || url.includes('doubleclick') ? 1 : 0)
      }));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!isSniffing) return;

    // ১. BEACON & FETCH INTERCEPTION (আপনার আমার চ্যাট ধরার জন্য)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      logRealPacket(url, 'FETCH_API');
      return originalFetch(...args);
    };

    // ২. WEBSOCKET INTERCEPTION (রিয়েল-টাইম কানেকশন থাকলে ধরবে)
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url: string, protocols: string | string[]) {
      logRealPacket(url, 'WEBSOCKET');
      return new OriginalWebSocket(url, protocols);
    } as any;
    window.WebSocket.prototype = OriginalWebSocket.prototype;

    // ৩. DEEP RESOURCE OBSERVER (ব্রাউজার ব্যাকগ্রাউন্ডে যা লোড করে)
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        logRealPacket(entry.name, (entry as any).initiatorType?.toUpperCase() || 'SYSTEM');
      });
    });
    observer.observe({ entryTypes: ['resource', 'navigation', 'mark', 'measure'] });

    // ৪. INTERVAL SCAN (ব্রাউজার ক্যাশে থাকা পুরাতন রিসোর্সগুলো বের করা)
    const scanInterval = setInterval(() => {
        const perf = window.performance.getEntriesByType("resource");
        const randomEntry = perf[Math.floor(Math.random() * perf.length)];
        if(randomEntry) logRealPacket(randomEntry.name, "RE-SCAN");
    }, 3000);

    return () => {
      window.fetch = originalFetch;
      window.WebSocket = OriginalWebSocket;
      observer.disconnect();
      clearInterval(scanInterval);
    };
  }, [isSniffing, logRealPacket]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={pulseDot(isSniffing)}></div>
          <div>
            <h1 style={titleStyle}>KERNEL_LEVEL_SNIFFER_v12</h1>
            <p style={subtitleStyle}>{isSniffing ? '>>> LISTENING ON ALL LOCAL PORTS...' : '>>> SYSTEM_READY'}</p>
          </div>
        </div>
        <button onClick={() => setIsSniffing(!isSniffing)} style={isSniffing ? stopButtonStyle : startButtonStyle}>
          {isSniffing ? <Square size={16} fill="#fff" /> : <Play size={16} fill="#000" />}
          {isSniffing ? "KILL PROCESS" : "INITIATE SCAN"}
        </button>
      </header>

      <div style={statsGrid}>
        <div style={statCard}><Activity size={20} /><p>PACKETS: {stats.total}</p></div>
        <div style={statCard}><Globe size={20} /><p>SSL_NODES: {stats.secure}</p></div>
        <div style={statCard}><ShieldAlert size={20} color={stats.threats > 0 ? 'red' : 'green'} /><p>TRACKERS: {stats.threats}</p></div>
      </div>

      <div style={terminalWrapper}>
        <div style={tableContainer}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{position: 'sticky', top: 0, background: '#000'}}>
              <tr style={{textAlign: 'left', color: '#444', fontSize: '10px'}}>
                <th style={thStyle}>TIMESTAMP</th>
                <th style={thStyle}>REMOTE_NODE_ADDRESS</th>
                <th style={thStyle}>INTENT</th>
                <th style={thStyle}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {packets.map((pkt) => (
                <tr key={pkt.id} style={{borderBottom: '1px solid #0a0a0a'}}>
                  <td style={tdStyle}>{pkt.time}</td>
                  <td style={{...tdStyle, color: '#fff'}}>{pkt.destination}</td>
                  <td style={{...tdStyle, color: '#00ff41'}}>{pkt.method}</td>
                  <td style={tdStyle}><span style={tagStyle}>{pkt.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Minimalist Cyberpunk Styles ---
const containerStyle: React.CSSProperties = { backgroundColor: '#000', minHeight: '100vh', padding: '20px', color: '#00ff41', fontFamily: 'monospace' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #111' };
const titleStyle = { fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', color: '#fff' };
const subtitleStyle = { fontSize: '9px', opacity: 0.5 };
const pulseDot = (active: boolean) => ({ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: active ? '#00ff41' : '#333' });
const startButtonStyle = { backgroundColor: '#00ff41', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const stopButtonStyle = { ...startButtonStyle, backgroundColor: '#ff0000', color: '#fff' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' };
const statCard = { background: '#050505', padding: '15px', border: '1px solid #111', display: 'flex', gap: '10px', fontSize: '12px' };
const terminalWrapper = { background: '#020202', border: '1px solid #111', borderRadius: '4px' };
const tableContainer = { height: '550px', overflowY: 'auto' as const };
const thStyle = { padding: '12px', borderBottom: '1px solid #111' };
const tdStyle = { padding: '10px', fontSize: '11px', color: '#555' };
const tagStyle = { border: '1px solid #00ff4144', padding: '2px 5px', fontSize: '9px' };