import { Asset, AssetType } from '../types';

// Costs derived from Handbook Section 7.3
export const REPLACEMENT_COSTS: Record<AssetType, number> = {
  [AssetType.TABLET]: 150,
  [AssetType.TRADE_PLATE]: 180,
  [AssetType.FUEL_CARD]: 50,
  [AssetType.UNIFORM]: 120,
  [AssetType.DASH_CAM]: 155,
  [AssetType.ID_BADGE]: 25,
  [AssetType.AA_CARD]: 50
};

export const calculateOutstandingLiability = (assets: Asset[]): number => {
  return assets.reduce((total, asset) => {
    // We only charge for items marked as 'Lost' or missing
    if (asset.status === 'Lost') {
      return total + (asset.replacementCost || REPLACEMENT_COSTS[asset.type] || 0);
    }
    return total;
  }, 0);
};