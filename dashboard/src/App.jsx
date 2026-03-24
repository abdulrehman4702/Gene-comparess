import React, { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import SensitivityCard from './components/SensitivityCard';
import { 
  InteractionScatterChart, 
  CorrelationsBarChart, 
  InteractionsHeatmap
} from './components/Charts';
import { 
  DrugRankingTable, 
  TargetClassInsights, 
  ComparativeDatabase 
} from './components/Tables';
import LiverComparisonChart from './components/LiverComparisonChart';

const API_BASE = 'http://localhost:5001/api';

const App = () => {
  const [data, setData] = useState({
    correlations: [],
    drugDetails: {},
    genesData: {},
    liverComparison: null,
    status: { status: 'loading', version: '2.0.0', endpoint: API_BASE }
  });
  const [loading, setLoading] = useState(true);
  const [selectedGene, setSelectedGene] = useState('CRP');
  const [selectedDrug, setSelectedDrug] = useState('napabucasin');
  const [selectedMetric, setSelectedMetric] = useState('ic50');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputExp, setInputExp] = useState(5.0);
  const [currentDrugResponses, setCurrentDrugResponses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(15);

  // Data Fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [corrRes, detailsRes, genesRes, liverRes, statusRes] = await Promise.all([
          fetch(`${API_BASE}/correlations`),
          fetch(`${API_BASE}/drug-details`),
          fetch(`${API_BASE}/genes-data`),
          fetch(`${API_BASE}/liver-comparison`),
          fetch(`${API_BASE}/status`)
        ]);
        
        setData({
          correlations: await corrRes.json(),
          drugDetails: await detailsRes.json(),
          genesData: await genesRes.json(),
          liverComparison: await liverRes.json(),
          status: await statusRes.json()
        });
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchDrugResponses = async () => {
      if (!selectedDrug) return;
      try {
        const res = await fetch(`${API_BASE}/drug-responses/${selectedDrug}`);
        const responses = await res.json();
        setCurrentDrugResponses(responses);
      } catch (err) {
        console.error("Drug response fetch error:", err);
      }
    };
    fetchDrugResponses();
  }, [selectedDrug]);

  // Derived Data
  // Reset pagination on search or gene change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGene, selectedMetric]);

  const currentCorr = useMemo(() => {
    return data.correlations.find(c => 
      c.gene === selectedGene && 
      c.drug === selectedDrug && 
      c.metric === selectedMetric
    );
  }, [data.correlations, selectedGene, selectedDrug, selectedMetric]);

  const currentDrugInfo = useMemo(() => {
    return data.drugDetails[selectedDrug] || { moa: 'N/A', target: 'N/A' };
  }, [data.drugDetails, selectedDrug]);

  const filteredCorrelations = useMemo(() => {
    return data.correlations
      .filter(c => c.gene === selectedGene && c.metric === selectedMetric)
      .filter(c => c.drug.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (a.spearman_p || 1) - (b.spearman_p || 1));
  }, [data.correlations, selectedGene, selectedMetric, searchTerm]);

  const chartData = useMemo(() => {
    return currentDrugResponses.map(r => {
      const geneExp = data.genesData[r.ModelID]?.[selectedGene];
      if (geneExp === undefined || r[selectedMetric] === null) return null;
      return { model: r.ModelID, x: geneExp, y: r[selectedMetric] };
    }).filter(d => d !== null);
  }, [currentDrugResponses, selectedGene, selectedMetric, data.genesData]);
  
  const geneComparisonData = useMemo(() => {
    return currentDrugResponses.map(r => {
      const geneExp = data.genesData[r.ModelID]?.[selectedGene];
      if (geneExp === undefined || r[selectedMetric] === null) return null;
      return { model: r.ModelID, x: geneExp, y: r[selectedMetric] };
    }).filter(d => d !== null);
  }, [currentDrugResponses, data.genesData, selectedMetric, selectedGene]);

  const heatmapData = useMemo(() => {
    const topDrugs = data.correlations
      .filter(c => c.metric === selectedMetric)
      .sort((a, b) => (a.spearman_p || 1) - (b.spearman_p || 1))
      .slice(0, 15)
      .map(c => c.drug);
    const uniqueDrugs = [...new Set(topDrugs)];
    const genes = ['CRP', 'HNF1A', 'MYC', 'ERBB2'];
    return uniqueDrugs.map(drug => {
      const row = { drug };
      genes.forEach(g => {
        const corr = data.correlations.find(c => c.drug === drug && c.gene === g && c.metric === selectedMetric);
        row[g] = corr ? corr.spearman_r : 0;
      });
      return row;
    });
  }, [data.correlations, selectedMetric]);

  const topCorrelations = useMemo(() => filteredCorrelations.slice(0, 10), [filteredCorrelations]);
  
  const topGeneRegressions = useMemo(() => {
    return data.correlations
      .filter(c => c.gene === selectedGene && c.metric === selectedMetric)
      .sort((a, b) => (a.spearman_p || 1) - (b.spearman_p || 1))
      .slice(0, 5);
  }, [data.correlations, selectedGene, selectedMetric]);

  const targetClassHits = useMemo(() => {
    const classes = ['Wnt', 'EGFR', 'MEK', 'PI3K'];
    const otherMetric = selectedMetric === 'ic50' ? 'auc' : 'ic50';
    return classes.map(cls => {
      let hit = data.correlations.find(c => c.target_class?.includes(cls) && c.gene === selectedGene && c.metric === selectedMetric);
      let isFallback = false;
      if (!hit) {
        hit = data.correlations.find(c => c.target_class?.includes(cls) && c.gene === selectedGene && c.metric === otherMetric);
        if (hit) isFallback = true;
      }
      return { class: cls, hit, isFallback, fallbackMetric: otherMetric };
    });
  }, [data.correlations, selectedGene, selectedMetric]);

  const prediction = useMemo(() => {
    if (!currentCorr || currentCorr.slope === null) return null;
    return currentCorr.slope * inputExp + currentCorr.intercept;
  }, [currentCorr, inputExp]);

  const regressionLine = useMemo(() => {
    if (!currentCorr || !chartData.length || currentCorr.slope === null) return [];
    const minX = Math.min(...chartData.map(d => d.x));
    const maxX = Math.max(...chartData.map(d => d.x));
    return [
      { x: minX, y: currentCorr.slope * minX + currentCorr.intercept },
      { x: maxX, y: currentCorr.slope * maxX + currentCorr.intercept }
    ];
  }, [currentCorr, chartData]);

  if (loading) return (
    <div className="loading-screen">
      <Loader2 className="spinner" size={48} />
      <p>Initializing Data Engine...</p>
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar 
        selectedGene={selectedGene} setSelectedGene={setSelectedGene}
        selectedMetric={selectedMetric} setSelectedMetric={setSelectedMetric}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        inputExp={inputExp} setInputExp={setInputExp}
        systemStatus={{ ...data.status, endpoint: API_BASE }}
      />

      <main className="main-content">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <StatsGrid 
          prediction={prediction} 
          currentCorr={currentCorr} 
          selectedMetric={selectedMetric} 
          selectedDrug={selectedDrug} 
        />

        <section style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          <SensitivityCard 
            currentCorr={currentCorr}
            selectedGene={selectedGene}
            inputExp={inputExp}
            selectedDrug={selectedDrug}
            currentDrugInfo={currentDrugInfo}
          />
        </section>

        <section style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem'}}>
          <CorrelationsBarChart topCorrelations={topCorrelations} />
          <InteractionsHeatmap heatmapData={heatmapData} />
        </section>

        <section style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem'}}>
          <DrugRankingTable 
            topRegressions={topGeneRegressions} 
            onSelect={setSelectedDrug} 
            selectedGene={selectedGene} 
          />
          <TargetClassInsights targetClassHits={targetClassHits} selectedGene={selectedGene} />
        </section>

        <LiverComparisonChart data={data.liverComparison} />

        <ComparativeDatabase 
          filteredCorrelations={filteredCorrelations}
          selectedDrug={selectedDrug}
          onSelect={setSelectedDrug}
          selectedGene={selectedGene}
          searchTerm={searchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
        />
      </main>
    </div>
  );
};

export default App;
