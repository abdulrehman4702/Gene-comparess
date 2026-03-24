import pandas as pd
import json
import os
import numpy as np
from typing import Dict, List, Any, Optional

print("Starting enhanced liver cancer comparison analysis (Expression + Resistance)...")

# 1. Identify models
model_df = pd.read_csv('Model.csv')
hb_models = model_df[model_df['OncotreePrimaryDisease'] == 'Hepatoblastoma'][['ModelID', 'CellLineName']]
hcc_models = model_df[model_df['OncotreePrimaryDisease'] == 'Hepatocellular Carcinoma'][['ModelID', 'CellLineName']]

hb_dict: Dict[str, str] = hb_models.set_index('ModelID')['CellLineName'].to_dict()
hcc_dict: Dict[str, str] = hcc_models.set_index('ModelID')['CellLineName'].to_dict()
all_target_ids: List[str] = list(hb_dict.keys()) + list(hcc_dict.keys())

print(f"Found {len(hb_dict)} HB and {len(hcc_dict)} HCC models.")

# 2. Analyze drug resistance (differential)
print("Analyzing drug resistance differences...")
drug_df = pd.read_csv('secondary screen.csv', usecols=['depmap_id', 'name', 'ic50', 'auc'])
drug_df.rename(columns={'depmap_id': 'ModelID'}, inplace=True)
liver_drugs = drug_df[drug_df['ModelID'].isin(all_target_ids)]

hb_ids = list(hb_dict.keys())
hcc_ids = list(hcc_dict.keys())

# Find common drugs
drug_counts = liver_drugs['name'].value_counts()
common_drugs = drug_counts[drug_counts >= 15].index.tolist()

analysis: List[Dict[str, Any]] = []
for drug in common_drugs:
    data = liver_drugs[liver_drugs['name'] == drug]
    hb_res = data[data['ModelID'].isin(hb_ids)]['ic50'].mean()
    hcc_res = data[data['ModelID'].isin(hcc_ids)]['ic50'].mean()
    
    if not pd.isna(hb_res) and not pd.isna(hcc_res) and hb_res > 0:
        analysis.append({
            "drug": str(drug),
            "HB_mean_ic50": float(hb_res),
            "HCC_mean_ic50": float(hcc_res),
            "ratio": float(hcc_res / hb_res)
        })

analysis_df = pd.DataFrame(analysis)
# Get top 3 drugs where HCC is more resistant and top 3 where HB is more resistant
top_hcc_res = analysis_df.sort_values(by='ratio', ascending=False).head(3)
top_hb_res = analysis_df.sort_values(by='ratio', ascending=True).head(3)
selected_drugs: List[str] = pd.concat([top_hcc_res, top_hb_res])['drug'].tolist()

print(f"Selected drugs for comparison: {selected_drugs}")

# 3. Process expression data and merge with resistance
results: Dict[str, Any] = {
    "Hepatoblastoma": [],
    "Hepatocellular Carcinoma": [],
    "comparisonDrugs": selected_drugs
}

header_df = pd.read_csv('expression.csv', nrows=0)
gene_columns = header_df.columns[6:]

found_count: int = 0
for chunk in pd.read_csv('expression.csv', chunksize=1000):
    mask = chunk['ModelID'].isin(all_target_ids)
    if mask.any():
        filtered_chunk: pd.DataFrame = chunk[mask]
        for _, row in filtered_chunk.iterrows():
            model_id: str = str(row['ModelID'])
            cell_line: str = str(hb_dict.get(model_id) or hcc_dict.get(model_id, ""))
            cancer_type: str = "Hepatoblastoma" if model_id in hb_dict else "Hepatocellular Carcinoma"
            
            # Expression filtering
            high_expression_genes_list: List[Dict[str, Any]] = []
            for gene in gene_columns:
                gene_val: float = float(row[gene])
                if gene_val >= 3.0:
                    high_expression_genes_list.append({"gene": str(gene), "value": gene_val})
            
            high_expression_genes_list.sort(key=lambda x: x['value'], reverse=True)
            
            # Resistance data for selected drugs
            res_profile: Dict[str, Optional[float]] = {}
            for drug_name in selected_drugs:
                res_subset = liver_drugs.loc[(liver_drugs['ModelID'] == model_id) & (liver_drugs['name'] == drug_name)]
                if not res_subset.empty:
                    val: float = float(res_subset['ic50'].iloc[0])
                    res_profile[drug_name] = val
                else:
                    res_profile[drug_name] = None

            # Get top 100 for storage
            top_genes_list: List[Dict[str, Any]] = high_expression_genes_list[:100]
            
            new_entry: Dict[str, Any] = {
                "modelId": model_id,
                "cellLine": cell_line,
                "highExpressionGenes": top_genes_list,
                "totalHighCount": len(high_expression_genes_list),
                "resistanceProfile": res_profile
            }
            
            results[cancer_type].append(new_entry)
            found_count = int(found_count + 1)
            
    if int(found_count) >= len(all_target_ids):
        break

# 4. Export to JSON
os.makedirs('server/data', exist_ok=True)

# Function to clean data for JSON (replace NaN/Inf with None)
def clean_for_json(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {str(k): clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(x) for x in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
    return obj

cleaned_results = clean_for_json(results)

with open('server/data/liver_comparison.json', 'w') as f:
    json.dump(cleaned_results, f)

print(f"Analysis complete. Results saved to server/data/liver_comparison.json")
