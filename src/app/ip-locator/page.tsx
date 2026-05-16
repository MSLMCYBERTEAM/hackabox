"use client";
import { useState } from 'react';
import { Globe, MapPin, ShieldAlert, Loader2, Search, Terminal, Navigation, Server, Cpu } from 'lucide-react';

export default function IpGeoLocator() {
  const [target, setTarget] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [geoReport, setGeoReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeGeoLookup = async () => {
    if (!target) return;
    setIsLocating(true);
    setError(null);
    setGeoReport(null);

    try {
      const response = await fetch('/api/locate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipOrDomain: target })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse coordinate payloads.");
      }

      setGeoReport(data.geoData);
    } catch (err: any) {
      setError(err.message || "Target network trace route failed.");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{__html: `
        .geo-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .data-row {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          border-bottom: 1px dashed #111;
          font-size: 14px;
        }
        @media (max-width: 850px) {
          .geo-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />

      {/* Header Section */}
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Globe color="#00f2ff" size={28} />
          <h1 style={titleStyle}>OSINT_IP_GEO_LOCATOR_V4</h1>
        </div>
        <p style={subtitleStyle}>Asynchronous IP/Domain coordinates scanner mapping regional infrastructure routing tables.</p>
      </div>

      {/* Input Box */}
      <div style={inputContainerStyle}>
        <input 
          type="text" 
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter IP Address or Host Domain (e.g. 8.8.8.8)" 
          style={inputStyle}
          disabled={isLocating}
        />
        <button 
          onClick={executeGeoLookup} 
          disabled={isLocating}
          style={{ ...locateButtonStyle, opacity: isLocating ? 0.6 : 1 }}
        >
          {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
          {isLocating ? "TRACE ROUTING..." : "LOCATE TARGET"}
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="geo-layout">
        
        {/* Left Side: Intel Details Table */}
        <div style={panelBoxStyle}>
          <div style={panelHeaderStyle}>
            <Terminal size={16} /> METADATA_COORDINATES_REPORT
          </div>

          <div style={{ minHeight: '300px', position: 'relative' }}>
            {!geoReport && !isLocating && !error && (
              <div style={emptyStateStyle}>
                <Search size={40} color="#111" />
                <p style={{ marginTop: '10px', fontSize: '12px' }}>[ OSINT ENGINE STANDBY ]</p>
              </div>
            )}

            {isLocating && (
              <div style={loadingStateStyle}>
                <Loader2 className="animate-spin" size={26} color="#0044ff" />
                <span>INTERCEPTING ISP BACKBONES...</span>
              </div>
            )}

            {error && (
              <div style={{ padding: '30px 15px', color: '#ff0055', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} /> {error}
              </div>
            )}

            {geoReport && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="data-row"><span style={{color: '#666'}}>RESOLVED_IP:</span><strong style={{color: '#fff'}}>{geoReport.query}</strong></div>
                <div className="data-row"><span style={{color: '#666'}}>COUNTRY:</span><span style={{color: '#00ff44'}}>{geoReport.country} ({geoReport.countryCode})</span></div>
                <div className="data-row"><span style={{color: '#666'}}>REGION / CITY:</span><span style={{color: '#fff'}}>{geoReport.regionName} / {geoReport.city}</span></div>
                <div className="data-row"><span style={{color: '#666'}}>ZIP_CODE:</span><span style={{color: '#fff'}}>{geoReport.zip || 'N/A'}</span></div>
                <div className="data-row"><span style={{color: '#666'}}>TIMEZONE:</span><span style={{color: '#ffaa00'}}>{geoReport.timezone}</span></div>
                <div className="data-row"><span style={{color: '#666'}}>ISP_PROVIDER:</span><span style={{color: '#00f2ff', fontSize: '13px', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={geoReport.isp}>{geoReport.isp}</span></div>
                <div className="data-row"><span style={{color: '#666'}}>COORDINATES:</span><span style={{color: '#fff', fontSize: '13px'}}>{geoReport.lat}, {geoReport.lon}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Satellite / Vector Grid Map View */}
        <div style={{ ...panelBoxStyle, minHeight: '350px' }}>
          <div style={panelHeaderStyle}>
            <MapPin size={16} color="#ff0055" /> LIVE_GEOLOCATION_GRID_MAP
          </div>

          {geoReport ? (
            <div style={{ width: '100%', height: 'calc(100% - 46px)', minHeight: '320px', borderRadius: '0 0 7px 7px', overflow: 'hidden' }}>
              <iframe 
                title="Target Location Map"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(120%)' }} // সাইবার ডার্ক লুকের জন্য ইনভার্ট ফিল্টার
                loading="lazy"
                src={`https://maps.google.com/maps?q=${geoReport.lat},${geoReport.lon}&z=13&output=embed`}
              />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#222', fontSize: '12px', height: '100%', minHeight: '320px' }}>
              [ MAP FEED OFFLINE: AWAITING RESOLVED PAYLOAD ]
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
  minHeight: '100vh',
  padding: '40px 20px',
  color: '#00f2ff',
  fontFamily: 'monospace',
  boxSizing: 'border-box'
};

const headerSectionStyle = {
  maxWidth: '1000px',
  margin: '0 auto 40px auto',
  borderLeft: '4px solid #0044ff',
  paddingLeft: '20px'
};

const titleStyle = { fontSize: 'clamp(18px, 5vw, 24px)', letterSpacing: '2px', margin: 0, color: '#fff' };
const subtitleStyle = { color: '#666', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' };

const inputContainerStyle: React.CSSProperties = {
  maxWidth: '1000px',
  margin: '0 auto 30px auto',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px'
};

const inputStyle = {
  flex: '1 1 400px',
  backgroundColor: '#050505',
  border: '1px solid #0044ff',
  padding: '15px',
  color: '#fff',
  fontSize: '15px',
  outline: 'none',
  borderRadius: '5px',
  fontFamily: 'monospace'
};

const locateButtonStyle = {
  flex: '1 1 200px',
  backgroundColor: '#0044ff',
  color: '#fff',
  border: 'none',
  padding: '15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  fontFamily: 'monospace'
};

const panelBoxStyle = {
  backgroundColor: '#050505',
  border: '1px solid #0044ff',
  borderRadius: '8px',
  boxShadow: '0 0 20px rgba(0, 68, 255, 0.05)',
  overflow: 'hidden'
};

const panelHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 15px',
  backgroundColor: '#0a0a0a',
  borderBottom: '1px solid #0044ff',
  fontSize: '12px',
  color: '#fff',
  fontWeight: 'bold' as const,
  letterSpacing: '1px'
};

const emptyStateStyle: React.CSSProperties = { 
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  textAlign: 'center', opacity: 0.3, width: '100%' 
};

const loadingStateStyle: React.CSSProperties = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  textAlign: 'center', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%'
};