import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, Label, ReferenceDot,
  BarChart, Bar, Cell
} from 'recharts';
import { LineChart as LineChartIcon, BarChart as BarChartIcon, Activity } from 'lucide-react';

export const InteractionScatterChart = ({ 
  chartData, regressionLine, prediction, inputExp, 
  selectedGene, selectedMetric, selectedDrug, title
}) => (
  <div className="card animated" style={{animationDelay: '0.4s'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
      <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><LineChartIcon size={20} /> {title || 'Comparative Interaction Analysis'}</h2>
    </div>
    <div className="chart-container" style={{minHeight: '400px'}}>
      <ResponsiveContainer width="100%" height={400} debounce={100}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" dataKey="x" name="Expression" stroke="var(--text-dim)" domain={[0, 15]} tick={{fontSize: 12}}>
            <Label value={`${selectedGene} Expression (log2 TPMLogp1)`} position="bottom" offset={20} fill="var(--text-dim)" style={{fontSize: '14px', fontWeight: 600}} />
          </XAxis>
          <YAxis type="number" dataKey="y" name="Response" stroke="var(--text-dim)" tick={{fontSize: 12}}>
             <Label value={`Drug Response (${selectedMetric.toUpperCase()})`} angle={-90} position="left" offset={-10} fill="var(--text-dim)" style={{fontSize: '14px', fontWeight: 600}} />
          </YAxis>
          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#161b22', border: '1px solid var(--glass-border)', borderRadius: '8px'}} />
          <Scatter name="Cell Lines" data={chartData} fill={title ? "#fcc419" : "var(--primary)"} opacity={title ? 0.6 : 0.4} />
          {regressionLine && regressionLine.length === 2 && (
            <Scatter name="Regression" data={regressionLine} line={{stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1}} shape={() => null} />
          )}
          {prediction !== null && (
            <ReferenceDot x={inputExp} y={prediction} r={6} fill="var(--accent)" stroke="#fff" strokeWidth={2} isFront={true} label={{ position: 'top', value: 'Prediction', fill: 'var(--accent)', fontSize: 12, fontWeight: 700 }} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const CorrelationsBarChart = ({ topCorrelations }) => (
  <div className="card animated" style={{animationDelay: '0.6s'}}>
    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem'}}><BarChartIcon size={20} /> Top Significant Correlations</h2>
    <div style={{height: '400px', minHeight: '400px'}}>
      <ResponsiveContainer width="100%" height={400} debounce={100}>
        <BarChart data={topCorrelations} margin={{ top: 20, right: 30, left: 40, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="drug" 
            stroke="var(--text-dim)" 
            tick={{fontSize: 10, fill: 'var(--text-dim)'}} 
            interval={0}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            type="number" 
            stroke="var(--text-dim)" 
            domain={[-1, 1]} 
            tick={{fontSize: 12, fill: 'var(--text-dim)'}}
          >
            <Label value="Spearman R" angle={-90} position="insideLeft" offset={10} style={{fill: 'var(--text-dim)', fontSize: '12px', fontWeight: 600}} />
          </YAxis>
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}} 
            contentStyle={{
              backgroundColor: '#0f172a', 
              border: '1px solid var(--glass-border)', 
              borderRadius: '8px',
              color: '#fff'
            }} 
            itemStyle={{color: '#fff'}}
          />
          <Bar dataKey="spearman_r" radius={[4, 4, 0, 0]}>
            {topCorrelations.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.spearman_r > 0 ? 'var(--danger)' : 'var(--success)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const InteractionsHeatmap = ({ heatmapData }) => {
  const getColor = (val) => {
    // Spearman R: -1 (Green/Sensitive) to +1 (Red/Resistant)
    if (val > 0) return `rgba(244, 63, 94, ${Math.min(1, val * 1.5)})`; 
    if (val < 0) return `rgba(16, 185, 129, ${Math.min(1, Math.abs(val) * 1.5)})`; 
    return 'rgba(255, 255, 255, 0.05)';
  };

  return (
    <div className="card animated" style={{animationDelay: '0.7s'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Activity size={20} /> Gene Interaction Heatmap (R)</h2>
        
        {/* Color Spectrum Legend */}
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-dim)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <div style={{width: 10, height: 10, borderRadius: '2px', backgroundColor: '#10b981'}}></div>
            <span>Sensitive</span>
          </div>
          <div style={{
            width: '80px', height: '8px', 
            background: 'linear-gradient(to right, #10b981, #1e293b, #f43f5e)',
            borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)'
          }}></div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span>Resistant</span>
            <div style={{width: 10, height: 10, borderRadius: '2px', backgroundColor: '#f43f5e'}}></div>
          </div>
        </div>
      </div>

      <div className="heatmap-container" style={{overflowX: 'auto', paddingBottom: '0.5rem'}}>
        <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '6px'}}>
          <thead>
            <tr>
              <th style={{textAlign: 'left', paddingLeft: '8px', fontSize: '0.8rem', color: 'var(--text-dim)'}}>Compound</th>
              {heatmapData.length > 0 && Object.keys(heatmapData[0]).filter(k => k !== 'drug').map(gene => (
                <th key={gene} style={{fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 700, textAlign: 'center'}}>{gene}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((d, i) => (
              <tr key={i} className="heatmap-row">
                <td style={{fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', padding: '6px 12px', fontWeight: 500}}>
                  {d.drug}
                </td>
                {Object.keys(d).filter(k => k !== 'drug').map(gene => (
                  <td key={gene} style={{
                    backgroundColor: getColor(d[gene]),
                    width: '70px', height: '35px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#fff', 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)', transition: 'transform 0.2s ease',
                    cursor: 'help'
                  }} title={`${gene} vs ${d.drug}: ${d[gene].toFixed(3)}`}>
                    {d[gene].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .heatmap-row td:not(:first-child):hover { transform: scale(1.1); z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.2) !important; }
        .heatmap-container::-webkit-scrollbar { height: 4px; }
        .heatmap-container::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 4px; }
      `}} />
    </div>
  );
};

export const SensitivityValueChart = ({ sensitivityData }) => (
  <div className="card animated" style={{animationDelay: '0.6s'}}>
    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem'}}><Activity size={20} /> Predicted Drug Sensitivity</h2>
    <div style={{height: '400px', minHeight: '400px'}}>
      <ResponsiveContainer width="100%" height={400} debounce={100}>
        <BarChart data={sensitivityData} layout="vertical" margin={{ left: 50, right: 30, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="var(--text-dim)" tick={{fontSize: 12}}>
            <Label value="Predicted Response (IC50/AUC)" position="bottom" offset={0} fill="var(--text-dim)" style={{fontSize: '12px', fontWeight: 600}} />
          </XAxis>
          <YAxis type="category" dataKey="drug" stroke="var(--text-dim)" width={120} fontSize={12} />
          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#161b22', border: '1px solid var(--glass-border)', borderRadius: '8px'}} />
          {/* Using IC50/AUC prediction values. Lower is usually more sensitive. */}
          <Bar dataKey="prediction" radius={[0, 4, 4, 0]}>
            {sensitivityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.prediction < 0.5 ? 'var(--success)' : 'var(--danger)'} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
