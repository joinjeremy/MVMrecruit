import { Asset, AssetStatus } from "../types";

export const returnAssetsFromCandidate = (candidateId: string, currentAssets: Asset[]): Asset[] => {
  return currentAssets.map(asset => {
    if (asset.allocatedToCandidateId === candidateId) {
      return {
        ...asset,
        status: AssetStatus.AVAILABLE,
        allocatedToCandidateId: undefined,
        history: [
          ...(asset.history || []),
          {
            date: new Date().toISOString(),
            action: 'Returned',
            notes: 'Returned automatically due to candidate status change (Churn/Delete).'
          }
        ]
      };
    }
    return asset;
  });
};