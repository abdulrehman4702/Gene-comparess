import pandas as pd  # type: ignore
import numpy as np  # type: ignore
from scipy import stats  # type: ignore
import seaborn as sns  # type: ignore
import matplotlib.pyplot as plt  # type: ignore
import os

# Create plots directory
os.makedirs('plots', exist_ok=True)

print("Reading gene expression data...")
# Extract ModelID, CRP (1401), and HNF1A (6927) columns
# From grep: 6647:CRP (1401), 7020:HNF1A (6927). 1-indexed.
# 0-indexed indices: 2 (ModelID), 6646 (CRP), 7019 (HNF1A), 7397 (MYC), 8167 (ERBB2)
expr_cols = [2, 6646, 7019, 7397, 8167]
expr_df = pd.read_csv('expression.csv', usecols=expr_cols)
expr_df.columns = ['ModelID', 'CRP', 'HNF1A', 'MYC', 'ERBB2']
print(f"Expression data loaded: {len(expr_df)} cell lines.")

print("Reading drug response data...")
drug_df = pd.read_csv('secondary screen.csv', usecols=['depmap_id', 'name', 'ic50', 'auc'])
drug_df.rename(columns={'depmap_id': 'ModelID'}, inplace=True)
print(f"Drug response data loaded: {len(drug_df)} entries.")

# Merge datasets
print("Merging datasets...")
merged_df = pd.merge(expr_df, drug_df, on='ModelID')
print(f"Merged data size: {len(merged_df)}")

# Remove rows where all gene data is missing (rare)
merged_df.dropna(subset=['CRP', 'HNF1A', 'MYC', 'ERBB2'], inplace=True)
print(f"Data size after dropping Gene NaNs: {len(merged_df)}")

# Analysis
results = []
genes = ['CRP', 'HNF1A', 'MYC', 'ERBB2']
metrics = ['ic50', 'auc']

drugs = merged_df['name'].unique()
print(f"Analyzing {len(drugs)} drugs...")

for drug in drugs:
    drug_data = merged_df[merged_df['name'] == drug]
    if len(drug_data) < 10: # Minimum cell lines required for analysis
        continue
        
    for gene in genes:
        for metric in metrics:
            # Drop NaNs specifically for this metric
            subset = drug_data[[gene, metric]].dropna()  # type: ignore
            if len(subset) < 10:
                continue
            x = subset[gene]
            y = subset[metric]
            
            # Use Speaman correlation for potentially non-linear but monotonic relationships
            # and it's robust to outliers. Pearson is also commonly used.
            corr_rho, p_rho = stats.spearmanr(x, y)
            corr_r, p_r = stats.pearsonr(x, y)
            
            results.append({
                'drug': drug,
                'gene': gene,
                'metric': metric,
                'spearman_r': corr_rho,
                'spearman_p': p_rho,
                'pearson_r': corr_r,
                'pearson_p': p_r,
                'n_cell_lines': len(drug_data)
            })

results_df = pd.DataFrame(results)

# Save results
results_df.to_csv('correlation_results.csv', index=False)
print("Correlation results saved to correlation_results.csv")

# Filter significant results (Spearman p < 0.05 OR any result for our selected genes)
# This ensures that "N/A" doesn't appear for our main genes in the UI.
significant = results_df[(results_df['spearman_p'] < 0.05) | (results_df['gene'].isin(genes))].sort_values(by='spearman_p')
print(f"Found {len(significant)} significant/key correlations.")
significant.to_csv('significant_correlations.csv', index=False)

# Visualization for top drugs
top_n = 5
top_hits = significant.head(top_n)

for i, row in top_hits.iterrows():
    drug = row['drug']
    gene = row['gene']
    metric = row['metric']
    
    plt.figure(figsize=(8, 6))
    data = merged_df[merged_df['name'] == drug]
    sns.regplot(data=data, x=gene, y=metric)
    plt.title(f"{gene} vs {drug} ({metric})\nSpearman r={row['spearman_r']:.2f}, p={row['spearman_p']:.4e}")
    plt.xlabel(f"{gene} Expression")
    plt.ylabel(f"Drug Response ({metric})")
    plt.tight_layout()
    filename = f"plots/{gene}_{drug}_{metric}.png".replace(' ', '_').replace('/', '_')
    plt.savefig(filename)
    plt.close()
    print(f"Generated plot: {filename}")

# Interpretation logic
def interpret(r):
    if r > 0:
        return "Resistance"
    else:
        return "Sensitivity"

top_hits['Interpretation'] = top_hits['spearman_r'].apply(interpret)
print("\nTop Significant Drugs:")
print(top_hits[['drug', 'gene', 'metric', 'spearman_r', 'spearman_p', 'Interpretation']])
