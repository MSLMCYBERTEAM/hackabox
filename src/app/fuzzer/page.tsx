"use client";
import { useState, useRef } from 'react';
import { 
  Terminal, Play, RefreshCw, FileCode, ShieldQuestion, Globe, Lock
} from 'lucide-react';

export default function DirectoryFuzzer() {
  const [url, setUrl] = useState('');
  const [isFuzzing, setIsFuzzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  // লুপ কন্ট্রোল করার জন্য useRef বেস্ট (স্টেট সিঙ্ক্রোনাইজেশন সমস্যা হয় না)
  const abortControllerRef = useRef(false);

  // --- MEGA WORDLIST (100+ PATHS) ---
  const megaWordlist = [
    '.env', '.env.local', '.git/config', '.htaccess', 'config.php', 'web.config', 'settings.py', 'docker-compose.yml', 'package.json', 'composer.json', 'robots.txt', 'sitemap.xml',
    'admin', 'administrator', 'wp-admin', 'cpanel', 'login', 'auth', 'user/login', 'admin/dashboard', 'manage', 'backend', 'controlpanel',
    'backup', 'backup.sql', 'db.sql', 'old', 'temp', 'data.zip', 'backup.zip', 'site.bak', 'database.tar.gz', 'dump.sql',
    'api', 'api/v1', 'api/v2', 'v1', 'v2', 'swagger-ui.html', 'graphql', 'graphiql', 'node_modules', 'dist', 'build', 'src',
    'phpmyadmin', 'sql', 'dbadmin', 'myadmin', 'pgadmin', 'pma', 'mysql', 'adminer.php',
    'uploads', 'files', 'public', 'private', 'secure', 'assets', 'images', 'img', 'js', 'css', 'include', 'inc', 'library', 'lib',
    'error_log', 'logs', 'access.log', 'debug.log', 'npm-debug.log',
    '.aws/credentials', '.ssh/id_rsa', 'server-status', 'server-info', '.well-known', 'cgi-bin', 'status', 'info.php', 'phpinfo.php',
    'test', 'demo', 'staging', 'dev', 'new', 'old-site', 'temp-site', 'v3', 'api/v3', 'readme.html', 'license.txt'
  ];

  const startFuzzing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || isFuzzing) return;

    let cleanUrl = url.replace(/\/$/, ""); 
    if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`;

    setIsFuzzing(true);
    abortControllerRef.current = false; // রিসেট
    setResults([]);
    setScanCount(0);
    
    // মেইন লুপ
    for (let i = 0; i < megaWordlist.length; i++) {
      if (abortControllerRef.current) break; // স্টপ বাটন দিলে থামবে

      const path = megaWordlist[i];
      setCurrentPath(`/${path}`);
      setScanCount(i + 1);
      setProgress(Math.round(((i + 1) / megaWordlist.length) * 100));

      try {
        const fullUrl = `${cleanUrl}/${path}`;
        const res = await fetch(`/api/fuzz?url=${encodeURIComponent(fullUrl)}`);
        const data = await res.json();

        // লজিক আপডেট: ৪৪৪ বাদে যা আছে সব দেখাবে
        if (data.exists && data.status !== 404) {
          setResults(prev => [{ 
            path: `/${path}`, 
            status: data.status, 
            url: fullUrl,
            severity: data.status === 403 ? 'HIGH' : data.status === 200 ? 'CRITICAL' : 'INFO'
          }, ...prev]);
        }
      } catch (err) {
        console.error("Path error:", path);
      }
    }
    
    setIsFuzzing(false);
    setCurrentPath('SCAN_COMPLETE');
  };

  const stopFuzzing = () => {
    abortControllerRef.current = true;
    setIsFuzzing(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <div className="pulse-icon"><Lock size={35} color="#00ff41" /></div>
            <div>
              <h1 style={styles.title}>DIR_FUZZER_PRO_v2</h1>
              <p style={styles.subtitle}>TOTAL PAYLOADS: {megaWordlist.length} | TARGET: {url || 'NONE'}</p>
            </div>
          </div>
        </header>

        <section style={styles.panel}>
          <form onSubmit={startFuzzing} style={styles.form}>
            <div style={styles.inputGroup}>
              <Globe size={18} color="#555" />
              <input 
                style={styles.input} 
                placeholder="target-site.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isFuzzing}
              />
            </div>
            
            {!isFuzzing ? (
              <button type="submit" style={{...styles.btn, backgroundColor: '#00ff41'}}>
                <Play size={18} /> EXECUTE FUZZ
              </button>
            ) : (
              <button type="button" onClick={stopFuzzing} style={{...styles.btn, backgroundColor: '#ff003c', color: '#fff'}}>
                <RefreshCw className="spin" size={18}/> STOP SCAN
              </button>
            )}
          </form>
        </section>

        <div style={styles.statsGrid}>
          <div style={styles.statBox}><span style={styles.statLabel}>PROGRESS</span><span style={styles.statValue}>{progress}%</span></div>
          <div style={styles.statBox}><span style={styles.statLabel}>REQUESTS</span><span style={styles.statValue}>{scanCount}/{megaWordlist.length}</span></div>
          <div style={styles.statBox}><span style={styles.statLabel}>FOUND</span><span style={{...styles.statValue, color: '#00ff41'}}>{results.length}</span></div>
        </div>

        <div style={styles.progressBarBg}>
          <div style={{...styles.progressBarFill, width: `${progress}%`}}></div>
        </div>
        <div style={styles.pathDisplay}>PROBING: <span style={{color: '#fff'}}>{currentPath}</span></div>

        <div style={styles.resultsWrapper}>
          <h3 style={styles.sectionTitle}><Terminal size={14}/> LIVE_FINDINGS_FEED</h3>
          <div style={styles.resultList}>
            {results.map((res, i) => (
              <div key={i} style={{...styles.resItem, borderLeft: `4px solid ${res.status === 200 ? '#00ff41' : '#ffae00'}`}}>
                <div style={styles.resMain}>
                  <FileCode size={18} color="#00ff41" />
                  <div style={styles.resInfo}>
                    <span style={styles.resPath}>{res.path}</span>
                    <span style={styles.resUrl}>{res.url}</span>
                  </div>
                </div>
                <div style={styles.resMeta}>
                  <span style={{...styles.tag, color: res.status === 200 ? '#00ff41' : '#ffae00'}}>{res.status} {res.severity}</span>
                  <a href={res.url} target="_blank" rel="noreferrer" style={styles.openBtn}>EXPLORE</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#000', minHeight: '100vh', color: '#00ff41', fontFamily: 'monospace', padding: '20px' } as React.CSSProperties,
  content: { maxWidth: '1000px', margin: '0 auto' },
  header: { marginBottom: '30px', borderBottom: '1px solid #111', paddingBottom: '20px' },
  title: { fontSize: '28px', color: '#fff', letterSpacing: '4px', margin: 0 },
  subtitle: { fontSize: '10px', color: '#444' },
  panel: { backgroundColor: '#050505', padding: '20px', border: '1px solid #111', borderRadius: '4px', marginBottom: '20px' },
  form: { display: 'flex', gap: '15px', flexWrap: 'wrap' as const },
  inputGroup: { flex: 3, display: 'flex', alignItems: 'center', backgroundColor: '#000', border: '1px solid #222', padding: '0 15px' },
  input: { flex: 1, backgroundColor: 'transparent', border: 'none', padding: '15px', color: '#fff', outline: 'none' },
  btn: { flex: 1, color: '#000', padding: '15px', fontWeight: 'bold' as const, cursor: 'pointer', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' },
  statBox: { backgroundColor: '#050505', border: '1px solid #111', padding: '15px' },
  statLabel: { fontSize: '10px', color: '#333' },
  statValue: { fontSize: '20px', fontWeight: 'bold' as const, color: '#fff' },
  progressBarBg: { height: '2px', backgroundColor: '#111', marginBottom: '10px' },
  progressBarFill: { height: '100%', backgroundColor: '#00ff41', transition: 'width 0.3s' },
  pathDisplay: { fontSize: '11px', color: '#222', marginBottom: '30px' },
  resultsWrapper: { marginTop: '20px' },
  sectionTitle: { fontSize: '12px', color: '#555', marginBottom: '15px' },
  resultList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  resItem: { backgroundColor: '#050505', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resMain: { display: 'flex', alignItems: 'center', gap: '15px' },
  resInfo: { display: 'flex', flexDirection: 'column' as const },
  resPath: { fontSize: '15px', fontWeight: 'bold' as const, color: '#fff' },
  resUrl: { fontSize: '10px', color: '#333' },
  resMeta: { display: 'flex', alignItems: 'center', gap: '20px' },
  tag: { fontSize: '11px', fontWeight: 'bold' as const },
  openBtn: { fontSize: '11px', color: '#fff', border: '1px solid #222', padding: '5px 10px', textDecoration: 'none' }
};