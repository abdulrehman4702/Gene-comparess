import React from 'react';
import { Activity, Target, Info, FlaskConical } from 'lucide-react';

const StatsGrid = ({ prediction, currentCorr, selectedMetric, selectedDrug }) => {
  return (
    <section className="stats-grid">
      <div className="card stat-card animated">
        <h3><Activity size={14} style={{marginRight: '8px'}} /> EXPECTED {selectedMetric.toUpperCase()}</h3>
        <div className="value" style={{color: 'var(--accent)'}}>{prediction !== null ? prediction.toFixed(3) : 'N/A'}</div>
      </div>
      <div className="card stat-card animated" style={{animationDelay: '0.1s'}}>
        <h3><Target size={14} style={{marginRight: '8px'}} /> CORRELATION (R)</h3>
        <div className="value">{currentCorr?.spearman_r?.toFixed(3) || 'N/A'}</div>
      </div>
      <div className="card stat-card animated" style={{animationDelay: '0.2s'}}>
        <h3><Info size={14} style={{marginRight: '8px'}} /> SIGNIFICANCE</h3>
        <div className="value" style={{fontSize: '1rem'}}>{currentCorr?.spearman_p?.toExponential(2) || 'N/A'}</div>
      </div>
      <div className="card stat-card animated" style={{animationDelay: '0.3s'}}>
        <h3><FlaskConical size={14} style={{marginRight: '8px'}} /> DRUG FOCUS</h3>
        <div className="value" style={{fontSize: '1rem', color: 'var(--text-main)'}}>{selectedDrug}</div>
      </div>
    </section>
  );
};

export default StatsGrid;
