// Testing branching - Day 5
//My first AI-Powered tennis app
// updated for better AI analysis-Jan 2026
import React, { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#0f172a'
  },
  sidebar: {
    width: '96px',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 0',
    gap: '30px',
    boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
    zIndex: 10
  },
  main: {
    flex: 1,
    padding: '40px 60px',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9'
  },
  statCard: {
    padding: '20px',
    borderRadius: '20px',
    textAlign: 'center',
    flex: 1
  },
  buttonPrimary: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  videoBox: {
    backgroundColor: '#020617',
    borderRadius: '32px',
    aspectRatio: '16/9',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    border: '4px solid #ffffff',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    zIndex: 5
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tabButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  tabButtonActive: {
    backgroundColor: '#4f46e5',
    color: 'white'
  }
};

const App = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tennis_api_key') || "");
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem('tennis_sessions');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeSession, setActiveSession] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('forehand'); // New: Track which stroke tab is active
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-save to local storage
  useEffect(() => {
    localStorage.setItem('tennis_sessions', JSON.stringify(sessions));
    localStorage.setItem('tennis_api_key', apiKey);
  }, [sessions, apiKey]);

  // Update video playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoPlaybackSpeed;
    }
  }, [videoPlaybackSpeed, activeSession]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!apiKey) {
      alert("Please enter your Gemini API Key in the top-left field before uploading.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const base64Data = await fileToBase64(file);
      const videoPart = { inlineData: { data: base64Data, mimeType: file.type } };
      const prompt = `
        Analyze this tennis video for forehand and backhand strokes if present. 
        Return a JSON response with these keys:
        - forehand: {powerScore: (0-100 or null if not present), techniqueScore: (0-100 or null), consistencyScore: (0-100 or null)}
        - backhand: {powerScore: (0-100 or null if not present), techniqueScore: (0-100 or null), consistencyScore: (0-100 or null)}
        - analysis: (Detailed coaching feedback for all detected strokes)
        - tips: (3 short bullet points for improvement)
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, videoPart] }],
          generationConfig: { responseMimeType: "application/json" },
          safetySettings: [
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!resultText) {
        throw new Error('No content returned from API');
      }

      // Clean up any markdown or extra text
      resultText = resultText.replace(/```json|```/g, '').trim();
      const result = JSON.parse(resultText);

      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        videoBase64: `data:${file.type};base64,${base64Data}`,
        ...result
      };

      setSessions([newSession, ...sessions]);
      setActiveSession(newSession);
    } catch (error) {
      console.error("AI Error:", error);
      alert(`Analysis failed: ${error.message}. Check your API key, video size/format, or try a different model.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlaybackSpeed = () => {
    setVideoPlaybackSpeed(prev => prev === 1 ? 0.5 : 1);
  };

  const currentStroke = activeSession?.[activeTab] || null;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <div style={{ fontSize: '24px' }}>🎾</div>
        <div style={{ opacity: 0.5 }}>📊</div>
        <div style={{ opacity: 0.5 }}>⚙️</div>
        <div style={{ marginTop: 'auto', fontSize: '12px', color: 'white', opacity: 0.3 }}>V4.1</div>
      </nav>

      <main style={styles.main}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>AI Tennis Coach Lab</h1>
            <input 
              placeholder="Paste Gemini API Key here..." 
              value={apiKey} 
              type="password"
              onChange={(e) => setApiKey(e.target.value)}
              style={{ 
                border: '1px solid #e2e8f0', 
                background: '#fff', 
                padding: '4px 8px',
                borderRadius: '6px',
                color: '#0f172a', 
                fontSize: '13px', 
                width: '300px', 
                marginTop: '8px' 
              }}
            />
          </div>
          <button 
            style={{ ...styles.buttonPrimary, opacity: isAnalyzing ? 0.7 : 1 }} 
            onClick={() => !isAnalyzing && fileInputRef.current.click()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "+ New Session"}
          </button>
          <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="video/*" />
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
          {/* Main Analysis View */}
          <section>
            <div style={styles.videoBox}>
              {activeSession ? (
                <>
                  <video ref={videoRef} src={activeSession.videoBase64 || activeSession.videoUrl} controls style={{ width: '100%', height: '100%' }} />
                  {isAnalyzing && <div style={styles.loadingOverlay}>Processing Video...</div>}
                </>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold' }}>
                  Upload a video to begin analysis
                </div>
              )}
              {activeSession && (
                <button 
                  onClick={togglePlaybackSpeed}
                  style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {videoPlaybackSpeed}x Speed
                </button>
              )}
            </div>

            {/* Stroke Tabs */}
            {activeSession && (
              <div style={styles.tabContainer}>
                <button 
                  style={{ ...styles.tabButton, ...(activeTab === 'forehand' ? styles.tabButtonActive : {}) }}
                  onClick={() => setActiveTab('forehand')}
                >
                  Forehand
                </button>
                <button 
                  style={{ ...styles.tabButton, ...(activeTab === 'backhand' ? styles.tabButtonActive : {}) }}
                  onClick={() => setActiveTab('backhand')}
                >
                  Backhand
                </button>
              </div>
            )}

            {/* AI Scores for Current Tab */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
              <div style={{ ...styles.statCard, backgroundColor: '#eef2ff', color: '#4338ca' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>POWER</div>
                <div style={{ fontSize: '32px', fontWeight: '900' }}>{currentStroke?.powerScore ?? '--'}</div>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: '#ecfdf5', color: '#047857' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>CONSISTENCY</div>
                <div style={{ fontSize: '32px', fontWeight: '900' }}>{currentStroke?.consistencyScore ?? '--'}</div>
              </div>
              <div style={{ ...styles.statCard, backgroundColor: '#fff7ed', color: '#c2410c' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>TECHNIQUE</div>
                <div style={{ fontSize: '32px', fontWeight: '900' }}>{currentStroke?.techniqueScore ?? '--'}</div>
              </div>
            </div>
            {!currentStroke && activeSession && (
              <p style={{ color: '#64748b', marginTop: '10px' }}>This stroke type not detected in video.</p>
            )}

            <div style={{ ...styles.card, marginTop: '30px', backgroundColor: '#1e1b4b', color: 'white' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>Coach's Verdict</h3>
              <p style={{ lineHeight: '1.6', opacity: 0.9 }}>{activeSession?.analysis || "Awaiting your next session analysis..."}</p>
            </div>
          </section>

          {/* History Sidebar */}
          <aside>
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Session History</h3>
              {sessions.length === 0 && <p style={{ color: '#94a3b8', fontSize: '14px' }}>No sessions recorded yet.</p>}
              {sessions.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setActiveSession(s)}
                  style={{ 
                    padding: '15px', 
                    borderRadius: '16px', 
                    backgroundColor: activeSession?.id === s.id ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold' }}>Multi-Stroke Session</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{s.date}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 'bold' }}>
                    Avg Score: {Math.round(((s.forehand?.powerScore || 0) + (s.forehand?.consistencyScore || 0) + (s.forehand?.techniqueScore || 0) + (s.backhand?.powerScore || 0) + (s.backhand?.consistencyScore || 0) + (s.backhand?.techniqueScore || 0)) / 6)}%
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;