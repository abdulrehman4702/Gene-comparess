import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  Label
} from 'recharts';
import { 
  Zap, 
  Activity, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ChevronDown, 
  Search,
  Filter,
  Check
} from 'lucide-react';

const LiverComparisonChart = ({ data }) => {
  const [viewMode, setViewMode] = useState('expression'); // 'expression', 'resistance', 'sensitivity'
  const [selectedDrug, setSelectedDrug] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Set initial drug if not set
  useMemo(() => {
    if (data && data.comparisonDrugs && data.comparisonDrugs.length > 0 && !selectedDrug) {
      setSelectedDrug(data.comparisonDrugs[0]);
    }
  }, [data, selectedDrug]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!data || (!data.Hepatoblastoma && !data["Hepatocellular Carcinoma"])) {
    return (
      <section className="card-container" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Analyzing Liver Comparison Data...</p>
        </div>
      </section>
    );
  }

  const combinedData = useMemo(() => {
    const hb = (data.Hepatoblastoma || []).map(item => ({
      name: item.cellLine,
      expressionCount: item.totalHighCount,
      resistanceValue: item.resistanceProfile[selectedDrug] || 0,
      sensitivityValue: Math.max(0, 10 - (item.resistanceProfile[selectedDrug] || 10)),
      type: 'Hepatoblastoma',
      topGenes: item.highExpressionGenes.slice(0, 5).map(g => g.gene).join(', ')
    }));

    const hcc = (data["Hepatocellular Carcinoma"] || []).map(item => ({
      name: item.cellLine,
      expressionCount: item.totalHighCount,
      resistanceValue: item.resistanceProfile[selectedDrug] || 0,
      sensitivityValue: Math.max(0, 10 - (item.resistanceProfile[selectedDrug] || 10)),
      type: 'Hepatocellular Carcinoma',
      topGenes: item.highExpressionGenes.slice(0, 5).map(g => g.gene).join(', ')
    }));

    return [...hb, ...hcc];
  }, [data, selectedDrug]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { type, expressionCount, resistanceValue, sensitivityValue, topGenes } = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#0f172a', 
          padding: '1.2rem', 
          border: '1px solid #1e293b',
          borderRadius: '0.75rem',
          color: '#f1f5f9',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          maxWidth: '320px',
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem', color: '#38bdf8' }}>{label}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Type:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{type}</span>
          </div>
          
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
              <span style={{ fontSize: '0.9rem' }}>High Genes Count: <strong>{expressionCount}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f43f5e' }}></div>
              <span style={{ fontSize: '0.9rem' }}>{selectedDrug} Resistance: <strong>{resistanceValue.toFixed(3)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              <span style={{ fontSize: '0.9rem' }}>{selectedDrug} Sensitivity: <strong>{sensitivityValue.toFixed(3)}</strong></span>
            </div>
          </div>

          {(viewMode === 'expression' || type === 'Hepatoblastoma') && topGenes && (
            <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>
              <strong>Top Genes:</strong> {topGenes}...
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getActiveMetric = () => {
    if (viewMode === 'expression') return 'expressionCount';
    if (viewMode === 'resistance') return 'resistanceValue';
    return 'sensitivityValue';
  };

  const getActiveColor = () => {
    if (viewMode === 'expression') return '#38bdf8';
    if (viewMode === 'resistance') return '#f43f5e';
    return '#10b981';
  };

  return (
    <section className="card-container" style={{ marginTop: '2rem', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={24} color="#38bdf8" />
            Liver Cancer Multi-Omic Comparison
          </h2>
          <p className="card-subtitle">Hepatoblastoma vs Hepatocellular Carcinoma (HCC)</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Custom Premium Dropdown */}
          {viewMode !== 'expression' && (
            <div className="custom-dropdown" ref={dropdownRef} style={{ position: 'relative', zIndex: 10 }}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #334155',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  cursor: 'pointer',
                  minWidth: '180px',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Filter size={16} color="#38bdf8" />
                  <span>{selectedDrug}</span>
                </div>
                <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
              </button>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
                  padding: '0.5rem',
                  animation: 'fadeInSlide 0.2s ease-out',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#334155 transparent'
                }}>
                  <div style={{ padding: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Select Compound
                  </div>
                  {data.comparisonDrugs.map(drug => (
                    <button
                      key={drug}
                      onClick={() => {
                        setSelectedDrug(drug);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        backgroundColor: selectedDrug === drug ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        color: selectedDrug === drug ? '#38bdf8' : '#cbd5e1',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedDrug === drug ? 'rgba(56, 189, 248, 0.1)' : 'transparent'}
                    >
                      <span>{drug}</span>
                      {selectedDrug === drug && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ 
            backgroundColor: '#1e293b', 
            borderRadius: '0.75rem', 
            padding: '0.25rem',
            display: 'flex',
            border: '1px solid #334155'
          }}>
            <button 
              onClick={() => setViewMode('expression')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                backgroundColor: viewMode === 'expression' ? '#38bdf8' : 'transparent',
                color: viewMode === 'expression' ? '#0f172a' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Activity size={14} /> Expression
            </button>
            <button 
              onClick={() => setViewMode('resistance')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                backgroundColor: viewMode === 'resistance' ? '#f43f5e' : 'transparent',
                color: viewMode === 'resistance' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <ShieldAlert size={14} /> Resistance
            </button>
            <button 
              onClick={() => setViewMode('sensitivity')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                backgroundColor: viewMode === 'sensitivity' ? '#10b981' : 'transparent',
                color: viewMode === 'sensitivity' ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <TrendingDown size={14} /> Sensitivity
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: 450 }}>
        <ResponsiveContainer>
          <BarChart
            data={combinedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <defs>
              <linearGradient id="hbGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="hccGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="resGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="senGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={80}
              stroke="#64748b"
              fontSize={11}
              fontWeight={500}
            />
            <YAxis 
              stroke="#64748b" 
            >
              <Label 
                value={viewMode === 'expression' ? 'High Expression Count' : (viewMode === 'resistance' ? 'Resistance Level (IC50)' : 'Sensitivity Score')} 
                angle={-90} 
                position="insideLeft" 
                style={{ fill: '#64748b', fontSize: '12px', fontWeight: 600 }} 
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
            
            <Bar 
              dataKey={getActiveMetric()} 
              name={viewMode === 'expression' ? 'Gene Exp Count' : (viewMode === 'resistance' ? 'Resistance' : 'Sensitivity')}
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-in-out"
            >
              {combinedData.map((entry, index) => {
                let fill = 'url(#hbGradient)';
                if (viewMode === 'resistance') fill = 'url(#resGradient)';
                else if (viewMode === 'sensitivity') fill = 'url(#senGradient)';
                else if (entry.type === 'Hepatocellular Carcinoma') fill = 'url(#hccGradient)';
                
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '0.75rem', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Info size={20} color={getActiveColor()} />
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
          {viewMode === 'expression' 
            ? "Showing the number of genes per cell line with expression levels >= 3. Hepatoblastoma (Sky) vs HCC (Indigo)." 
            : viewMode === 'resistance'
              ? `Showing resistance (IC50) for ${selectedDrug}. Higher bars indicate higher resistance (reduced drug efficacy).`
              : `Showing sensitivity score for ${selectedDrug}. Higher bars indicate higher sensitivity (enhanced drug efficacy).`}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-dropdown::-webkit-scrollbar { width: 6px; }
        .custom-dropdown::-webkit-scrollbar-track { background: transparent; }
        .custom-dropdown::-webkit-scrollbar-thumb { background: #334155; borderRadius: 3px; }
        .custom-dropdown::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </section>
  );
};

export default LiverComparisonChart;
