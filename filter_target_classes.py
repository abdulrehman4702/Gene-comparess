import pandas as pd

# Load results
significant = pd.read_csv('significant_correlations.csv')
drug_info = pd.read_csv('secondary screen.csv', usecols=['name', 'moa', 'target']).drop_duplicates()

# Merge with drug info
merged = pd.merge(significant, drug_info, left_on='drug', right_on='name', how='left')

# Define target classes
targets = ['Wnt', 'EGFR', 'MEK', 'PI3K']
target_results = []

for t in targets:
    subset = merged[merged['moa'].str.contains(t, case=False, na=False) | 
                    merged['target'].str.contains(t, case=False, na=False)]
    if not subset.empty:
        # Get top 3 for each class
        target_results.append(subset.head(3))

if target_results:
    final_targets = pd.concat(target_results)
    print("Significant Drugs in Target Classes:")
    print(final_targets[['drug', 'gene', 'metric', 'spearman_r', 'spearman_p', 'moa']])
    final_targets.to_csv('target_class_results.csv', index=False)
else:
    print("No significant drugs found in the target classes.")
