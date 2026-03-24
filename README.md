# Genes Compare

**Genes Compare** is a professional pharmacogenomic research tool designed to analyze the relationship between gene expression levels and drug sensitivity across hundreds of cancer cell lines. It identifies potential biomarkers and predicts whether specific gene expressions lead to drug sensitivity or resistance.

## 🏗️ Project Architecture

The project is built with a modular three-layer architecture:

1.  **Data Analysis (Python)**: The core statistical engine that processes large datasets and performs correlation analysis.
2.  **Backend (Node.js/Express)**: A REST API that serves processed data and regression parameters to the frontend.
3.  **Dashboard (React/Vite)**: A high-end, interactive visualization dashboard for researchers.

---

## 🚀 Getting Started

### Prerequisites

-   **Python 3.8+**
-   **Node.js 18+**
-   **npm**

### 1. Python Analysis Setup
Install the required data science libraries:
```bash
pip install pandas numpy scipy seaborn matplotlib
```

### 2. Backend Server Setup
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

### 3. Frontend Dashboard Setup
Navigate to the `dashboard` directory and install dependencies:
```bash
cd dashboard
npm install
```

---

## 🛠️ Usage

### Step 1: Run Data Analysis
Process the raw genomics data and generate statistical results:
```bash
python analyze_genes.py
python export_data.py
```
*Note: This will generate processed JSON files in `server/data/`.*

### Step 2: Start the Backend
```bash
cd server
node server.js
```
The server will run on [http://localhost:5001](http://localhost:5001).

### Step 3: Start the Dashboard
```bash
cd dashboard
npm run dev
```
The dashboard will be available at the local Vite address (usually [http://localhost:5173](http://localhost:5173)).

---

## 📊 Data Sources

-   `expression.csv`: Gene expression data (RNA-seq).
-   `secondary screen.csv`: Drug response data (IC50, AUC, MOA).
-   `Model.csv`: Cell line metadata.

## 🧪 Approaches Used

-   **Spearman Correlation**: Robust statistical method to find monotonic relationships between gene expression and drug efficacy.
-   **Linear Regression**: Used to calculate trend lines for scatter plot visualizations.
-   **Automated Drug Tagging**: Keywords-based classification of drugs into target classes (e.g., Wnt, EGFR, MEK).

---

## 🛡️ License
ISC License
