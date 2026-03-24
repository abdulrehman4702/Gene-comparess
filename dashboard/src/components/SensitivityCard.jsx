import React from 'react';
import { Gauge } from 'lucide-react';

const SensitivityCard = ({ currentCorr, selectedGene, inputExp, selectedDrug, currentDrugInfo }) => {
  return (
    <div className="card animated" style={{animationDelay: '0.5s', display: 'flex', flexDirection: 'column'}}>
      <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Gauge size={20} /> Sensitivity Profile</h2>
      <div style={{marginTop: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
         <div style={{fontSize: '3.5rem', fontWeight: 900, color: currentCorr?.spearman_r > 0 ? 'var(--danger)' : 'var(--success)', letterSpacing: '-0.05rem'}}>
            {currentCorr ? (currentCorr.spearman_r > 0 ? 'RESISTANT' : 'SENSITIVE') : 'N/A'}
         </div>
         <p style={{color: 'var(--text-dim)', marginTop: '1.5rem', maxWidth: '85%', lineHeight: '1.6'}}>
           With <b>{selectedGene}</b> expression at <b>{inputExp.toFixed(1)}</b>, the model predicts <b>{currentCorr?.spearman_r > 0 ? 'reduced' : 'enhanced'}</b> drug efficacy for <b>{selectedDrug}</b>.
         </p>
         
         <div style={{width: '100%', height: '1px', background: 'var(--glass-border)', margin: '2.5rem 0'}}></div>
         
         <div style={{alignSelf: 'stretch', textAlign: 'left'}}>
            <label style={{color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700}}>Mechanism of Action</label>
            <p style={{marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.5'}}>{currentDrugInfo.moa}</p>
            
            <label style={{color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginTop: '1.75rem', fontWeight: 700}}>Molecular Target</label>
            <p style={{marginTop: '0.5rem', fontSize: '0.95rem'}}>{currentDrugInfo.target}</p>
         </div>
      </div>
    </div>
  );
};

export default SensitivityCard;
