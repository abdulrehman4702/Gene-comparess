const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Data automation
const DATA_DIR = path.join(__dirname, 'data');
const REQUIRED_FILES = ['correlations.json', 'drug_details.json', 'genes_data.json', 'drug_responses.json'];
const SHOULD_REBUILD = process.argv.includes('--rebuild') || !fs.existsSync(DATA_DIR) || REQUIRED_FILES.some(f => !fs.existsSync(path.join(DATA_DIR, f)));

if (SHOULD_REBUILD) {
  console.log("Data missing or rebuild requested. Running Python pipeline... (This may take a few minutes)");
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    // Run analysis and export from the root directory
    const rootDir = path.join(__dirname, '..');
    execSync('python3 analyze_genes.py', { cwd: rootDir, stdio: 'inherit' });
    execSync('python3 export_data.py', { cwd: rootDir, stdio: 'inherit' });
    console.log("Python pipeline completed successfully.");
  } catch (err) {
    console.error("Error running Python pipeline:", err.message);
  }
}

console.log("Loading datasets into memory for fast access...");
const correlations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'correlations.json')));
const drugDetails = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drug_details.json')));
const genesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'genes_data.json')));
const drugResponses = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drug_responses.json')));

console.log("Data loaded. Starting server...");

// API Endpoints
app.get('/api/correlations', (req, res) => {
  res.json(correlations);
});

app.get('/api/drug-details', (req, res) => {
  res.json(drugDetails);
});

app.get('/api/genes-data', (req, res) => {
  res.json(genesData);
});

app.get('/api/drug-responses/:drug', (req, res) => {
  const drug = req.params.drug;
  const responses = drugResponses[drug];
  if (responses) {
    res.json(responses);
  } else {
    res.status(404).json({ error: "Drug response data not found" });
  }
});

// Health check
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    drugsCount: Object.keys(drugResponses).length,
    significantHits: correlations.length
  });
});

app.listen(PORT, () => {
  console.log(`Genes Compare Backend running at http://localhost:${PORT}`);
});
