import React from 'react';
import { Search, Activity, FlaskConical, Gauge, Info } from 'lucide-react';

const Sidebar = ({ 
  selectedGene, setSelectedGene, 
  selectedMetric, setSelectedMetric, 
  searchTerm, setSearchTerm,
  systemStatus 
}) => {
  const genes = ['CRP', 'HNF1A', 'MYC'];
  const metrics = ['ic50', 'auc'];

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
