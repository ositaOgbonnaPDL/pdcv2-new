import {Asset} from '../types';

export const convertToAssetMap = (
  assets: Map<string, Asset> | Record<string, Asset>,
) => {
  if (assets instanceof Map) return assets;

  const _assets = Object.values(assets).map((asset) => {
    return [asset.id, asset] as const;
  });

  return new Map(_assets);
};
