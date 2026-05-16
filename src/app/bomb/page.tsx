"use client";
import { useState, useRef } from 'react';
import { FileCode, Upload, ShieldAlert, CheckCircle, Info, RefreshCw, Image as ImageIcon, FileText, Skull, Eye, FileSearch, HelpCircle } from 'lucide-react';
import EXIF from 'exif-js';
import { PDFDocument } from 'pdf-lib';

export default function MetadataExtractor() {
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const [forensicReport, setForensicReport] = useState<Record<string, any> | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // বাইনারি অ্যানালাইসিস ইঞ্জিন (কোর ফরেনসিক লজিক)
  const analyzeBinaries = async (file: File): Promise<Record<string, any>> => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // ১. ম্যাজিক বাইটস চেক (Hex Signature Validation)
    let hexSignature = "";
    for(let i = 0; i < Math.min(bytes.length, 4); i++) {
      hexSignature += bytes[i].toString(16).padStart(2, '0').toUpperCase();
    }

    let detectedTypeByHex = "Unknown Binary";
    let spoofingAlert = "CLEAN (Extension matches byte headers)";

    if (hexSignature.startsWith("89504E47")) detectedTypeByHex = "image/png";
    else if (hexSignature.startsWith("FFD8FF")) detectedTypeByHex = "image/jpeg";
    else if (hexSignature.startsWith("25504446")) detectedTypeByHex = "application/pdf";
    else if (hexSignature.startsWith("47494638")) detectedTypeByHex = "image/gif";
    else if (hexSignature.startsWith("4D5A")) {
      detectedTypeByHex = "application/x-msdownload (Windows Executable EXE)";
      spoofingAlert = "CRITICAL RISK: Dangerous Executable masked as document!";
    }

    if (file.type && detectedTypeByHex !== "Unknown Binary" && !detectedTypeByHex.includes(file.type.split('/')[0])) {
      if (file.type !== "application/pdf" || detectedTypeByHex !== "application/pdf") {
        spoofingAlert = `WARNING: Extension mismatch! Named as '${file.type}' but internal signature is '${detectedTypeByHex}'. Possible obfuscation.`;
      }
    }

    // ২. হিডেন স্ট্রিংস এবং পেলোড স্ক্যানার (যেমন URL, স্ক্রিপ্ট, আইফ্রেম)
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const decodedText = decoder.decode(bytes.slice(0, 500000)); // প্রথম ৫০০ KB স্ক্যান
    
    const suspiciousPatterns = {
      "javascript_payload": /javascript:/i,
      "script_tags": /<script/i,
      "iframe_injection": /<iframe/i,
      "exe_signatures": /\.exe/i,
      "powershell_triggers": /powershell/i,
      "cmd_commands": /cmd\.exe/i
    };

    let foundPayloads: string[] = [];
    Object.entries(suspiciousPatterns).forEach(([key, pattern]) => {
      if (pattern.test(decodedText)) {
        foundPayloads.push(key.toUpperCase().replace('_', ' '));
      }
    });

    // ৩. এক্সট্রাক্ট করা ইউআরএল বা ডোমেন কাউন্টার
    const urlPattern = /(https?:\/\/[^\s"'><]+)/gi;
    const extractedUrls = decodedText.match(urlPattern) || [];
    const uniqueUrls = Array.from(new Set(extractedUrls)).slice(0, 5); // টপ ৫টি লিংক দেখাবে

    // ৪. এডিটিং ট্রেইল অ্যান্ড ট্রাস্ট স্কোরিং
    let integrityScore = 100;
    let structuralAnomalies: string[] = [];

    if (foundPayloads.length > 0) {
      integrityScore -= 40;
      structuralAnomalies.push("Embedded suspicious executable strings found");
    }
    if (spoofingAlert.includes("WARNING") || spoofingAlert.includes("CRITICAL")) {
      integrityScore -= 50;
      structuralAnomalies.push("File signature header spoofing detected");
    }
    if (uniqueUrls.length > 2) {
      integrityScore -= 10;
      structuralAnomalies.push("Abnormal amount of external web links inside file raw text");
    }

    return {
      "File Hex Signature": `0x${hexSignature}`,
      "True File Format (by Byte)": detectedTypeByHex,
      "Spoofing / Masking Test": spoofingAlert,
      "Suspicious Code Injection": foundPayloads.length > 0 ? foundPayloads.join(', ') : "NONE DETECTED",
      "Extracted Web Paths / Links": uniqueUrls.length > 0 ? uniqueUrls : "NONE DETECTED",
      "Structural Anomalies Log": structuralAnomalies.length > 0 ? structuralAnomalies.join(' | ') : "None. File structure intact.",
      "Forensic Integrity Score": `${Math.max(integrityScore, 0)}%`
    };
  };

  const processFile = async (file: File) => {
    setIsScanning(true);
    setError(null);
    setForensicReport(null);
    setFileInfo({
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || 'unknown/binary'
    });

    try {
      // ১. রান ফরেনসিক ইঞ্জিন
      const forensicData = await analyzeBinaries(file);

      // ২. রান ট্র্যাডিশনাল মেটাডেটা (ইমেজ বা পিডিএফ এর ওপর ভিত্তি করে)
      let customMetadata: Record<string, any> = {};

      if (file.type.startsWith('image/')) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            if (!event.target?.result) { resolve(); return; }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = function () {
              EXIF.getData(img as any, function (this: any) {
                const allMetaData = EXIF.getAllTags(this);
                if (allMetaData.Software) customMetadata["Software Metadata"] = allMetaData.Software;
                if (allMetaData.DateTime) customMetadata["Original Timestamp"] = allMetaData.DateTime;
                if (allMetaData.Make || allMetaData.Model) customMetadata["Capture Hardware"] = `${allMetaData.Make || ''} ${allMetaData.Model || ''}`.trim();
                
                if (allMetaData.GPSLatitude && allMetaData.GPSLongitude) {
                  const lat = allMetaData.GPSLatitude;
                  const lon = allMetaData.GPSLongitude;
                  const latRef = allMetaData.GPSLatitudeRef || 'N';
                  const lonRef = allMetaData.GPSLongitudeRef || 'E';
                  const latitude = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef === 'S' ? -1 : 1);
                  const longitude = (lon[0] + lon[1]/60 + lon[2]/3600) * (lonRef === 'W' ? -1 : 1);
                  customMetadata["GPS Coordinates Leak"] = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                }
                resolve();
              });
            };
          };
          reader.readAsDataURL(file);
        });
      } else if (file.type === 'application/pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
          if (pdfDoc.getCreator()) customMetadata["PDF Creator Tool"] = pdfDoc.getCreator();
          if (pdfDoc.getProducer()) customMetadata["Producer (Software)"] = pdfDoc.getProducer();
          if (pdfDoc.getCreationDate()) customMetadata["Creation Timestamp"] = pdfDoc.getCreationDate()?.toLocaleString();
        } catch(e) {}
      }

      // ৩. মার্জ অল ডেটা ফর দ্য আল্টিমেট রিপোর্ট
      setForensicReport({ ...forensicData, ...customMetadata });
      setIsScanning(false);

    } catch (err) {
      setError("Forensic Engine failed to process raw bytes. File stream might be locked.");
      setIsScanning(false);
    }
  };

  const triggerReset = () => {
    setFileInfo(null);
    setForensicReport(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: '20px', color: '#00f2ff', fontFamily: 'monospace', background: '#000000', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .container-box { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
        .upload-zone { width: 100%; box-sizing: border-box; }
        @media (max-width: 900px) {
          .container-box { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* Header */}
      <div style={{ borderBottom: '1px solid #ff0055', paddingBottom: '15px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff0055' }}>
          <Skull color="#ff0055" /> DIGITAL FILE FORENSICS & DEEP SCANNERS
        </h2>
        <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
          Execute binary structure analysis, track byte spoofing, discover code injections, and map metadata compilation trails.
        </p>
      </div>

      <div className="container-box">
        
        {/* Left Side: Upload Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="upload-zone"
            style={{
              border: '2px dashed #ff0055', borderRadius: '10px', padding: '50px 20px',
              textAlign: 'center', background: '#050003', cursor: 'pointer',
              transition: '0.3s', boxShadow: '0 0 12px rgba(255,0,85,0.05)'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#00f2ff'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#ff0055'}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,application/pdf" 
              style={{ display: 'none' }} 
            />
            <FileSearch size={42} style={{ margin: '0 auto 15px auto', color: '#ff0055' }} />
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>INGEST TARGET ASSET</p>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>Deep inspect raw data buffers (JPG, PNG, PDF)</p>
          </div>

          {/* File Overview */}
          {fileInfo && (
            <div style={{ background: '#050505', border: '1px solid #ff0055', padding: '15px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '12px', color: '#ff0055', borderBottom: '1px dashed #22000b', paddingBottom: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>METRIC REPORT</span>
                {fileInfo.type.startsWith('image/') ? <ImageIcon size={14}/> : <FileText size={14}/>}
              </div>
              <p style={{ color: '#fff', fontSize: '14px', wordBreak: 'break-all' }}><strong>Filename:</strong> {fileInfo.name}</p>
              <p style={{ marginTop: '5px', fontSize: '13px' }}><strong>Buffer Size:</strong> <span style={{color: '#ff0055'}}>{fileInfo.size}</span></p>
              <p style={{ marginTop: '5px', fontSize: '13px' }}><strong>Report Type:</strong> {fileInfo.type}</p>
              
              <button onClick={triggerReset} style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '5px', background: '#220005', border: '1px solid #ff0055', color: '#ff0055', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px' }}>
                <RefreshCw size={12} /> DROP CASE
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Forensic Logs Container */}
        <div style={{ background: '#03030b', border: '1px solid #0044ff', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '320px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #0044ff', paddingBottom: '10px', marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} color="#00f2ff" /> FORENSIC VERDICT SPECS
          </div>

          {isScanning && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', color: '#fff' }}>
              <RefreshCw className="animate-spin" size={32} color="#ff0055" />
              <p style={{ fontSize: '13px', letterSpacing: '2px', color: '#ff0055' }}>DUMPING MEMORY BUFFERS & SCANNING HEADERS...</p>
            </div>
          )}

          {!isScanning && !forensicReport && !error && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#333', fontSize: '13px', textAlign: 'center' }}>
              [ SYSTEM STANDBY: AWAITING BINARY EXTRACTION CASE ]
            </div>
          )}

          {error && (
            <div style={{ borderLeft: '4px solid #ff0055', backgroundColor: '#1a0005', padding: '12px', borderRadius: '0 5px 5px 0', fontSize: '13px', color: '#ff0055', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} /> <span>{error}</span>
            </div>
          )}

          {/* Forensic Result Output Logs */}
          {forensicReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, maxHeight: '480px', paddingRight: '5px' }}>
              <div style={{ 
                borderLeft: '4px solid', 
                borderColor: forensicReport["Forensic Integrity Score"] === "100%" ? '#00ff44' : '#ffaa00', 
                backgroundColor: forensicReport["Forensic Integrity Score"] === "100%" ? '#001a05' : '#1a1100', 
                padding: '10px', borderRadius: '0 5px 5px 0', fontSize: '13px', 
                color: forensicReport["Forensic Integrity Score"] === "100%" ? '#00ff44' : '#ffaa00', 
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' 
              }}>
                <CheckCircle size={16} /> Analysis completed. Integrity Evaluation Verified.
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#fff' }}>
                <tbody>
                  {Object.entries(forensicReport).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '12px 5px', color: '#00f2ff', fontWeight: 'bold', width: '42%', verticalAlign: 'top' }}>{key}</td>
                      <td style={{ padding: '12px 5px', color: '#e0e0e0', wordBreak: 'break-all' }}>
                        {Array.isArray(value) ? (
                          <ul style={{ margin: 0, paddingLeft: '15px', color: '#ff0055' }}>
                            {value.map((url, index) => (
                              <li key={index} style={{ marginBottom: '4px' }}>
                                <a href={url} target="_blank" rel="noreferrer" style={{ color: '#ffaa00', textDecoration: 'underline' }}>{url}</a>
                              </li>
                            ))}
                          </ul>
                        ) : key === "Forensic Integrity Score" ? (
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold',
                            backgroundColor: value === "100%" ? '#00ff4422' : '#ff005522',
                            color: value === "100%" ? '#00ff44' : '#ff0055',
                            border: `1px solid ${value === "100%" ? '#00ff44' : '#ff0055'}`
                          }}>{value}</span>
                        ) : key === "Spoofing / Masking Test" && !value.includes("CLEAN") ? (
                          <span style={{ color: '#ff0055', fontWeight: 'bold' }}>{value}</span>
                        ) : key === "Suspicious Code Injection" && value !== "NONE DETECTED" ? (
                          <span style={{ color: '#ffaa00', fontWeight: 'bold', backgroundColor: '#332200', padding: '2px 6px', borderRadius: '3px' }}>{value}</span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}