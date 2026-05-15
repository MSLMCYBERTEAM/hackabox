"use client";
import { useState } from 'react';
import { MapPin, Globe, Server, Loader2, Search, Target, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function IPGeoLocator() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const locateIP = async () => {
    // যদি ইনপুট খালি থাকে, তবে নিজের আইপি লোকেট করবে
    const targetIp = ip.trim() || ""; 
    setLoading(true);
    setError("");
    setData(null);

    try {
      // JSONP বা CORS জ্যাম এড়াতে এই API টি অনেক বেশি নির্ভরযোগ্য
      const response = await fetch(`http://ip-api.com/json/${targetIp}`);
      const result = await response.json();

      if (result.status === "fail") {
        setError(`Error: ${result.message}`);
      } else {
        // ডেটা ফরম্যাট ম্যাপিং
        setData({
          country_name: result.country,
          country_code: result.countryCode,
          region: result.regionName,
          city: result.city,
          zip: result.zip,
          lat: result.lat,
          lon: result.lon,
          isp: result.isp,
          org: result.org,
          as: result.as,
          timezone: result.timezone,
          query: result.query
        });
      }
    } catch (err) {
      setError("CORS or Connection Error. Please try again or check your browser extensions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Globe color="#00f2ff" size={28} />
          <h1 style={titleStyle}>IP_GEO_LOCATOR_ULTIMATE</h1>
        </div>
        <p style={subtitleStyle}>Advanced IP Intelligence & Digital Tracking System.</p>
      </div>

      <div style={inputContainerStyle}>
        <input 
          type="text" 
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IP Address (leave blank for your IP)" 
          style={inputStyle}
        />
        <button 
          onClick={locateIP} 
          disabled={loading}
          style={{ ...scanButtonStyle, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Target size={18} />}
          {loading ? "SEARCHING..." : "LOCATE"}
        </button>
      </div>

      {error && (
        <div style={errorBoxStyle}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div style={resultWrapperStyle}>
        {!data && !loading && (
          <div style={emptyStateStyle}>
            <Search size={50} color="#111" />
            <p style={{ marginTop: '10px' }}>SYSTEM READY: INPUT TARGET IP</p>
          </div>
        )}

        {data && (
          <div style={gridContainerStyle}>
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}><MapPin size={16} /> GEOGRAPHIC</h3>
              <div style={infoRow}><span>COUNTRY:</span> <strong>{data.country_name}</strong></div>
              <div style={infoRow}><span>CITY/REGION:</span> <strong>{data.city}, {data.region}</strong></div>
              <div style={infoRow}><span>ZIP CODE:</span> <strong>{data.zip}</strong></div>
              <div style={infoRow}><span>IP QUERY:</span> <strong>{data.query}</strong></div>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}><Server size={16} /> INFRASTRUCTURE</h3>
              <div style={infoRow}><span>ISP:</span> <strong>{data.isp}</strong></div>
              <div style={infoRow}><span>ORGANIZATION:</span> <strong>{data.org}</strong></div>
              <div style={infoRow}><span>ASN:</span> <strong>{data.as}</strong></div>
              <div style={infoRow}><span>TIMEZONE:</span> <strong>{data.timezone}</strong></div>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}><ShieldCheck size={16} /> COORDINATES</h3>
              <div style={infoRow}><span>LATITUDE:</span> <strong>{data.lat}</strong></div>
              <div style={infoRow}><span>LONGITUDE:</span> <strong>{data.lon}</strong></div>
              <div style={{...infoRow, border: 'none', marginTop: '15px'}}>
                 <a 
                   href={`https://www.google.com/maps?q=${data.lat},${data.lon}`} 
                   target="_blank" 
                   style={mapLinkStyle}
                 >
                   VIEW ON GOOGLE MAPS
                 </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles (Fixed for Dark Theme) ---
const containerStyle: React.CSSProperties = {
  backgroundColor: '#000', minHeight: '100vh', padding: '40px 20px', color: '#00f2ff', fontFamily: 'monospace'
};

const headerSectionStyle = {
  maxWidth: '1000px', margin: '0 auto 40px auto', borderLeft: '5px solid #0044ff', paddingLeft: '20px'
};

const titleStyle = { fontSize: '24px', letterSpacing: '2px', margin: 0 };
const subtitleStyle = { color: '#444', fontSize: '12px', marginTop: '5px' };

const inputContainerStyle: React.CSSProperties = {
  maxWidth: '1000px', margin: '0 auto 30px auto', display: 'flex', gap: '10px'
};

const inputStyle = {
  flex: 1, backgroundColor: '#050505', border: '1px solid #0044ff', padding: '15px', color: '#fff', outline: 'none', borderRadius: '4px'
};

const scanButtonStyle = {
  backgroundColor: '#0044ff', color: '#fff', border: 'none', padding: '0 30px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' as const, display: 'flex', alignItems: 'center', gap: '10px'
};

const errorBoxStyle = {
  maxWidth: '1000px', margin: '0 auto 20px auto', background: '#200', border: '1px solid #f00', padding: '10px', color: '#f55', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px'
};

const gridContainerStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'
};

const resultWrapperStyle = { maxWidth: '1000px', margin: '0 auto' };

const cardStyle = {
  background: '#050505', border: '1px solid #111', borderRadius: '8px', padding: '20px'
};

const cardTitleStyle = {
  fontSize: '14px', color: '#0044ff', borderBottom: '1px solid #111', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px'
};

const infoRow = {
  display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px', borderBottom: '1px solid #0a0a0a', paddingBottom: '5px'
};

const mapLinkStyle = {
  background: '#0044ff', color: '#fff', padding: '8px 12px', textDecoration: 'none', borderRadius: '4px', fontSize: '11px', width: '100%', textAlign: 'center' as const
};

const emptyStateStyle: React.CSSProperties = { textAlign: 'center', padding: '100px 0', opacity: 0.2 };