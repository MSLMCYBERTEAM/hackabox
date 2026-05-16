"use client";
import { useState } from 'react';
import { ShieldAlert, CheckCircle, RefreshCw, Terminal, Globe, Link2, Eye, ShieldCheck } from 'lucide-react';

export default function ReconScraper() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Extraction Failed');
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to reconnaissance server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', color: '#00f2ff', fontFamily: 'monospace', background: '#000000', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .container-box { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
        @media (max-width: 900px) {
          .container-box { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* Header */}
      <div style={{ borderBottom: '1px solid #0044ff', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal color="#00f2ff" /> OSINT WEB RECONNAISSANCE ENGINE
        </h2>
        <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
          Extract target metadata, inspect source anchor maps, fetch script logs, and evaluate remote endpoint security.
        </p>
      </div>

      <div className="container-box">
        
        {/* Left Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={triggerScrape} style={{ background: '#03030b', border: '1px solid #0044ff', padding: '20px', borderRadius: '10px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>TARGET URL / DOMAIN</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                placeholder="example.com or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ flex: 1, background: '#000', border: '1px solid #0044ff', padding: '12px', color: '#fff', borderRadius: '5px', fontFamily: 'monospace', outline: 'none' }}
              />
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ background: '#0044ff', border: 'none', color: '#fff', padding: '0 20px', borderRadius: '5px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'INJECT'}
              </button>
            </div>
          </form>

          {/* Quick Target Summary Card */}
          {report && (
            <div style={{ background: '#050505', border: '1px solid #0044ff', padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#888', borderBottom: '1px dashed #111', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={14} color="#00f2ff"/> NETWORK TARGET SPECS
              </div>
              <p style={{ color: '#fff', fontSize: '13px', wordBreak: 'break-all' }}><strong>Resolved Endpoint:</strong> <span style={{color: '#00ff44'}}>{report.target}</span></p>
              <p style={{ marginTop: '6px', fontSize: '13px' }}><strong>Internal Anchors:</strong> {report.links.internalCount}</p>
              <p style={{ marginTop: '6px', fontSize: '13px' }}><strong>External Outbounds:</strong> {report.links.externalCount}</p>
              <p style={{ marginTop: '6px', fontSize: '13px' }}><strong>Images Discovered:</strong> {report.assets.imageCount}</p>
              <p style={{ marginTop: '6px', fontSize: '13px' }}><strong>Scripts Loaded:</strong> {report.assets.scriptCount}</p>
            </div>
          )}
        </div>

        {/* Right Output Intelligence Report */}
        <div style={{ background: '#03030b', border: '1px solid #0044ff', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '350px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #0044ff', paddingBottom: '10px', marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="#00f2ff" /> CONSOLE INTEL INTELLIGENCE
          </div>

          {isLoading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', color: '#fff' }}>
              <RefreshCw className="animate-spin" size={30} color="#00f2ff" />
              <p style={{ fontSize: '13px', letterSpacing: '1px' }}>EXTRACTING TARGET DOM SOURCE CODES...</p>
            </div>
          )}

          {!isLoading && !report && !error && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#444', fontSize: '13px', textAlign: 'center' }}>
              [ MONITOR STANDBY: INPUT A TARGET PATH TO RUN MAPS ]
            </div>
          )}

          {error && (
            <div style={{ borderLeft: '4px solid #ff0055', backgroundColor: '#1a0005', padding: '12px', borderRadius: '0 5px 5px 0', fontSize: '13px', color: '#ff0055', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} /> <span>{error}</span>
            </div>
          )}

          {/* Scrape Data Layout Output */}
          {report && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1, maxHeight: '500px', paddingRight: '5px' }}>
              <div style={{ borderLeft: '4px solid #00ff44', backgroundColor: '#001a05', padding: '10px', borderRadius: '0 5px 5px 0', fontSize: '13px', color: '#00ff44', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Crawl Completed! Logs successfully mapped.
              </div>

              {/* Section 1: Meta Intelligence */}
              <div>
                <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', borderBottom: '1px dashed #222', paddingBottom: '4px' }}>[1] Meta Intelligence</h4>
                <p style={{ fontSize: '13px', color: '#aaa' }}><strong>Title:</strong> {report.metaIntel.title}</p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}><strong>Description:</strong> {report.metaIntel.description}</p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}><strong>Keywords:</strong> {report.metaIntel.keywords}</p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}><strong>Core Engine:</strong> {report.metaIntel.generator}</p>
              </div>

              {/* Section 2: Security Assessment */}
              <div>
                <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', borderBottom: '1px dashed #222', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={14} color="#00ff44"/> [2] Endpoint Security Assessment</h4>
                <p style={{ fontSize: '13px', color: '#aaa' }}><strong>Backend Server:</strong> {report.securityAnalysis.server}</p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}><strong>Framework Token:</strong> {report.securityAnalysis.poweredBy}</p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}><strong>SSL Encryption:</strong> <span style={{ color: report.securityAnalysis.sslActive.includes('YES') ? '#00ff44' : '#ff0055' }}>{report.securityAnalysis.sslActive}</span></p>
                <p style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}><strong>Cookie Leak Trail:</strong> {report.securityAnalysis.cookiesLeaked}</p>
              </div>

              {/* Section 3: Discovered Outbound Maps */}
              {report.links.externalList.length > 0 && (
                <div>
                  <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', borderBottom: '1px dashed #222', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}><Link2 size={14} color="#ffaa00"/> [3] Top Outbound Connections</h4>
                  <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px', color: '#ffaa00' }}>
                    {report.links.externalList.map((link: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '4px', wordBreak: 'break-all' }}>{link}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}