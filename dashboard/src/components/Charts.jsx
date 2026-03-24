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
    <div style={{height: '350px', minHeight: '350px'}}>
      <ResponsiveContainer width="100%" height={350} debounce={100}>
        <BarChart data={topCorrelations} layout="vertical" margin={{ left: 50, right: 30, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="var(--text-dim)" domain={[-1, 1]} tick={{fontSize: 12}} />
          <YAxis type="category" dataKey="drug" stroke="var(--text-dim)" width={120} fontSize={12} />
          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#161b22', border: '1px solid var(--glass-border)', borderRadius: '8px'}} />
          <Bar dataKey="spearman_r" radius={[0, 4, 4, 0]}>
            {topCorrelations.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.spearman_r > 0 ? 'var(--danger)' : 'var(--success)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const InteractionsHeatmap = ({ heatmapData }) => (
  <div className="card animated" style={{animationDelay: '0.7s'}}>
    <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem'}}><Activity size={20} /> Gene Interaction Heatmap (R)</h2>
    <div className="heatmap-container" style={{overflowX: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '4px'}}>
        <thead>
          <tr>
            <th></th>
            <th style={{fontSize: '0.7rem', color: 'var(--text-dim)'}}>CRP</th>
            <th style={{fontSize: '0.7rem', color: 'var(--text-dim)'}}>HNF1A</th>
          </tr>
        </thead>
        <tbody>
          {heatmapData.map((d, i) => (
            <tr key={i}>
              <td style={{fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', padding: '2px 8px'}}>{d.drug}</td>
              <td style={{
                background: d.CRP > 0 ? `rgba(255, 107, 107, ${Math.abs(d.CRP)})` : `rgba(81, 207, 102, ${Math.abs(d.CRP)})`,
                width: '60px', height: '30px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>{d.CRP.toFixed(2)}</td>
              <td style={{
                background: d.HNF1A > 0 ? `rgba(255, 107, 107, ${Math.abs(d.HNF1A)})` : `rgba(81, 207, 102, \$\{Math.abs(d.HNF1A)\})`,
                width: '60px', height: '30px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>{d.HNF1A.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
