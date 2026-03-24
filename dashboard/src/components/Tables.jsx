import React from 'react';
import { Target, FlaskConical, ChevronRight } from 'lucide-react';

export const DrugRankingTable = ({ topRegressions, selectedGene, onSelect }) => (
  <div className="card animated" style={{animationDelay: '0.9s'}}>
    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem'}}><Target size={20} /> Drug Ranking (Primary: {selectedGene})</h2>
    <div className="table-container mini">
      <table style={{width: '100%', fontSize: '0.85rem'}}>
        <thead>
          <tr>
            <th>Drug</th>
            <th>Corr (R)</th>
            <th>p-value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {topRegressions.map((c, i) => (
            <tr key={i} onClick={() => onSelect(c.drug)} style={{cursor: 'pointer'}}>
              <td style={{fontWeight: 700}}>{c.drug}</td>
              <td style={{color: c.spearman_r > 0 ? 'var(--danger)' : 'var(--success)'}}>{c.spearman_r?.toFixed(3)}</td>
              <td>{c.spearman_p?.toExponential(1)}</td>
              <td>
                <span className={c.spearman_r > 0 ? 'resistance' : 'sensitivity'}>
                  {c.spearman_r > 0 ? 'RESISTANT' : 'SENSITIVE'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const TargetClassInsights = ({ targetClassHits, selectedGene }) => (
  <div className="card animated" style={{animationDelay: '1.0s'}}>
    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem'}}><FlaskConical size={20} /> Target Class Insights ({selectedGene})</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
      {targetClassHits.map((h, i) => (
        <div key={i} className="card" style={{padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'}}>
          <div style={{fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.4rem'}}>{h.class} Inhibitor</div>
          <div style={{fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.25rem'}}>{h.hit ? h.hit.drug : 'N/A'}</div>
          {h.hit && (
            <div style={{fontSize: '0.8rem', color: h.hit.spearman_r > 0 ? 'var(--danger)' : 'var(--success)'}}>
              R = {h.hit.spearman_r.toFixed(3)} {h.isFallback && `(${h.fallbackMetric.toUpperCase()})`}
            </div>
          )}
          {h.isFallback && (
            <div style={{fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.2rem'}}>Showing {h.fallbackMetric.toUpperCase()} results</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const ComparativeDatabase = ({ 
  filteredCorrelations, selectedDrug, onSelect, 
  selectedGene, searchTerm, currentPage, setCurrentPage, rowsPerPage 
}) => {
  const totalPages = Math.ceil(filteredCorrelations.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredCorrelations.slice(startIndex, startIndex + rowsPerPage);

  return (
    <section className="card animated" style={{animationDelay: '0.6s', marginTop: '2rem'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>Comparative Database ({selectedGene})</h2>
        <div style={{fontSize: '0.75rem', color: 'var(--text-dim)'}}>
          {filteredCorrelations.length} hits found {searchTerm && `for "${searchTerm}"`}
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Drug Compound</th>
              <th>Metric</th>
              <th>Correlation (R)</th>
              <th>P-Value</th>
              <th>Clinical Trend</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((c, i) => (
              <tr key={i} className={selectedDrug === c.drug ? 'active' : ''}>
                <td style={{fontWeight: 700}}>{c.drug}</td>
                <td style={{opacity: 0.7}}>{c.metric.toUpperCase()}</td>
                <td style={{color: c.spearman_r > 0 ? 'var(--danger)' : 'var(--success)'}}>{c.spearman_r?.toFixed(3)}</td>
                <td>{c.spearman_p?.toExponential(2)}</td>
                <td>
                  <span className={c.spearman_r > 0 ? 'resistance' : 'sensitivity'}>
                    {c.spearman_r > 0 ? 'Resistant' : 'Sensitive'}
                  </span>
                </td>
                <td>
                  <button 
                    className="select-btn"
                    onClick={() => onSelect(c.drug)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="page-btn"
          >
            Previous
          </button>
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};
