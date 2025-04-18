export const getBasePath = (): string => {
  // For local development vs production
  return import.meta.env.DEV ? '' : '/texas-county-choropleth-view';
};

export const getAssetPath = (assetPath: string): string => {
  // Add a check to prevent double slashes
  if (assetPath.startsWith('/')) {
    return `${getBasePath()}${assetPath}`;
  }
  return `${getBasePath()}/${assetPath}`;
};