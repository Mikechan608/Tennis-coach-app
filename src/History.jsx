import React from 'react';

const History = ({ sessions, setActiveSession, styles }) => {
  return (
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
  );
};

export default History;