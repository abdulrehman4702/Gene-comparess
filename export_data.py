import pandas as pd  # type: ignore
import json
import os
from scipy import stats  # type: ignore

print("Exporting data for frontend...")

# 1. Load significant correlations
significant = pd.read_csv('significant_correlations.csv')

# 2. Extract gene expression data (small)
expr_cols = [2, 6646, 7019, 7397, 8167]
expr_df = pd.read_csv('expression.csv', usecols=expr_cols)
expr_df.columns = ['ModelID', 'CRP', 'HNF1A', 'MYC', 'ERBB2']
expr_df.dropna(inplace=True)
# Handle duplicates by taking the mean for each ModelID
expr_df = expr_df.groupby('ModelID').mean().reset_index()
# Replace NaN with None for valid JSON (null)
expr_df = expr_df.where(pd.notnull(expr_df), None)
genes_data = expr_df.set_index('ModelID').to_dict(orient='index')
# Ensure output directory exists
os.makedirs('server/data', exist_ok=True)

with open('server/data/genes_data.json', 'w') as f:
    json.dump(genes_data, f)

# 3. Calculate regression parameters for each significant correlation
genes = ['CRP', 'HNF1A', 'MYC', 'ERBB2']
metrics = ['ic50', 'auc']
drugs = significant['drug'].unique()

print("Loading raw data for regression...")
drug_responses_raw = pd.read_csv('secondary screen.csv', usecols=['depmap_id', 'name', 'ic50', 'auc'])
drug_responses_raw.rename(columns={'depmap_id': 'ModelID'}, inplace=True)

print("Calculating regression parameters...")
merged_all = pd.merge(expr_df, drug_responses_raw, on='ModelID')

for drug in drugs:
    drug_data = merged_all[merged_all['name'] == drug]
    for gene in genes:
        for metric in metrics:
            subset = drug_data.loc[:, [gene, metric]].dropna()
            if len(subset) < 10: continue
            
            # Linear Regression
            try:
                res = stats.linregress(subset[gene].astype(float), subset[metric].astype(float))
                
                # Find existing correlation record to update
                mask = (significant['drug'] == drug) & (significant['gene'] == gene) & (significant['metric'] == metric)  # type: ignore
                if mask.any():  # type: ignore
                    idx = significant.loc[mask].index[0]
                    significant.at[idx, 'slope'] = res.slope
                    significant.at[idx, 'intercept'] = res.intercept
            except Exception as e:
                print(f"Skipping regression for {drug} - {gene} - {metric}: {e}")

import numpy as np  # type: ignore

# 4. Export correlations with target class tagging
# Load drug info again to mapping target classes
drug_info_full = pd.read_csv('secondary screen.csv', usecols=['name', 'moa', 'target']).drop_duplicates()

def get_target_class(row):
    moa = str(row['moa']).lower()
    target = str(row['target']).lower()
    classes = []
    if any(k in moa or k in target for k in ['wnt']): classes.append('Wnt')
    if any(k in moa or k in target for k in ['egfr']): classes.append('EGFR')
    if any(k in moa or k in target for k in ['mek']): classes.append('MEK')
    if any(k in moa or k in target for k in ['pi3k']): classes.append('PI3K')
    return ', '.join(classes) if classes else 'Other'

# Merge target class info
significant = pd.merge(significant, drug_info_full, left_on='drug', right_on='name', how='left')
significant['target_class'] = significant.apply(get_target_class, axis=1)

# Cleanup merge and handle Infinity
significant = significant.replace([np.inf, -np.inf], np.nan).replace({np.nan: None})
correlations = significant.to_dict(orient='records')
with open('server/data/correlations.json', 'w') as f:
    json.dump(correlations, f)

# 5. Export drug details (MOA/Target)
drug_info = pd.read_csv('secondary screen.csv', usecols=['name', 'moa', 'target']).drop_duplicates()
drug_info = drug_info.fillna('Unknown').replace([np.inf, -np.inf], np.nan).replace({np.nan: None})
drug_details = drug_info.set_index('name').to_dict(orient='index')
with open('server/data/drug_details.json', 'w') as f:
    json.dump(drug_details, f)

# 6. Export drug response data grouped by drug (pre-filtered for speed)
top_drugs = list(set(significant['drug'].unique().tolist()))
print(f"Exporting details for {len(top_drugs)} drugs...")
drug_responses = drug_responses_raw[drug_responses_raw['name'].isin(top_drugs)]
expr_model_ids = expr_df['ModelID'].tolist()
drug_responses = drug_responses[drug_responses['ModelID'].isin(expr_model_ids)]

# Replace NaN and Inf with None
drug_responses = drug_responses.replace([np.inf, -np.inf], np.nan).replace({np.nan: None})

grouped_responses = {}
for drug, group in drug_responses.groupby('name'):
    grouped_responses[str(drug)] = group[['ModelID', 'ic50', 'auc']].to_dict(orient='records')

with open('server/data/drug_responses.json', 'w') as f:
    json.dump(grouped_responses, f)

print("Data exported successfully.")
