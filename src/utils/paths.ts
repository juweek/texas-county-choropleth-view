export const getBasePath = (): string => {
  // In production (non-dev), include the base path
  return import.meta.env.DEV ? '/texas-county-choropleth-view' : '/texas-county-choropleth-view';
};

export const getAssetPath = (assetPath: string): string => {
  const fullPath = assetPath.startsWith('/') 
    ? `${getBasePath()}${assetPath}` 
    : `${getBasePath()}/${assetPath}`;
    
  console.log(`Asset path for ${assetPath}: ${fullPath}`);
  return fullPath;
};