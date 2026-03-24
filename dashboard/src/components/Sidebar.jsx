import React from 'react';
import { Search, Activity, FlaskConical, Gauge, Info, TrendingUp, TrendingDown } from 'lucide-react';

const Sidebar = ({ 
  selectedGene, setSelectedGene, 
  selectedMetric, setSelectedMetric, 
  inputExp, setInputExp,
  systemStatus 
}) => {
  const [localExp, setLocalExp] = React.useState(inputExp);
  const genes = ['CRP', 'HNF1A', 'MYC', 'ERBB2'];
  const metrics = ['ic50', 'auc'];

  const handleApply = () => {
    setInputExp(parseFloat(localExp) || 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <aside className="sidebar">
      <div className="logo">Genes Compare</div>
      
      <div className="sidebar-section">
        <label className="sidebar-label">Gene Selection</label>
        <div className="gene-buttons">
          {genes.map(gene => (
            <button 
              key={gene}
              className={`gene-btn ${selectedGene === gene ? 'active' : ''}`}
              onClick={() => setSelectedGene(gene)}
            >
              {gene}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Response Metric</label>
        <div className="metric-toggle">
          {metrics.map(metric => (
            <button 
              key={metric}
              className={`metric-btn ${selectedMetric === metric ? 'active' : ''}`}
              onClick={() => setSelectedMetric(metric)}
            >
              {metric.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label">Target Expression Level</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <button 
              onClick={() => setLocalExp(prev => Math.max(0, (parseFloat(prev) || 0) - 0.1).toFixed(1))}
              style={{ padding: '0.7rem', backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              <TrendingDown size={16} />
            </button>
            <input 
              type="text" 
              value={localExp}
              onChange={(e) => setLocalExp(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                textAlign: 'center',
                outline: 'none',
                width: '60px'
              }}
            />
            <button 
              onClick={() => setLocalExp(prev => ((parseFloat(prev) || 0) + 0.1).toFixed(1))}
              style={{ padding: '0.7rem', backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              <TrendingUp size={16} />
            </button>
          </div>
          <button 
            onClick={handleApply}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
          >
            Apply Changes
          </button>
        </div>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.6rem', textAlign: 'center' }}>
          Current: <strong>{inputExp}</strong> log2 TPM
        </p>
      </div>

      <div className="sidebar-section" style={{marginTop: 'auto'}}>
        <div className="system-info">
          <p>System Version: {systemStatus.version || '2.0.0'}</p>
          <p>Status: <span style={{color: systemStatus.status === 'online' ? 'var(--success)' : 'var(--danger)'}}>{systemStatus.status.toUpperCase()}</span></p>
          <p>Endpoints: {systemStatus.endpoint}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
