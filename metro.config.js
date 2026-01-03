const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Enhanced resolver configuration for EAS builds
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname),
    '@assets': path.resolve(__dirname, 'assets'),
    '@context': path.resolve(__dirname, 'context'),
    '@components': path.resolve(__dirname, 'components'),
    '@constants': path.resolve(__dirname, 'constants'),
    '@hooks': path.resolve(__dirname, 'hooks'),
  },
  // Use both approaches for maximum compatibility
  extraNodeModules: {
    '@': path.resolve(__dirname),
    '@assets': path.resolve(__dirname, 'assets'),
    '@context': path.resolve(__dirname, 'context'),
    '@components': path.resolve(__dirname, 'components'),
    '@constants': path.resolve(__dirname, 'constants'),
    '@hooks': path.resolve(__dirname, 'hooks'),
    ...config.resolver.extraNodeModules,
  },
  platforms: ['ios', 'android', 'native', 'web'],
  sourceExts: [...config.resolver.sourceExts],
  assetExts: [...config.resolver.assetExts], // Keep existing asset extensions
};

// Custom resolver function for @ imports (improved version)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const actualPath = moduleName.replace('@/', '');
    const fullPath = path.resolve(__dirname, actualPath);
    
    // Check if file exists as-is (for assets like fonts, images)
    try {
      if (fs.existsSync(fullPath)) {
        return {
          filePath: fullPath,
          type: 'sourceFile',
        };
      }
    } catch (e) {
      // Continue to extension checking
    }
    
    // Try different extensions for source files
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    for (const ext of extensions) {
      const pathWithExt = fullPath + ext;
      try {
        if (fs.existsSync(pathWithExt)) {
          return {
            filePath: pathWithExt,
            type: 'sourceFile',
          };
        }
      } catch (e) {
        // Continue to next extension
      }
    }
    
    // Try as directory with index file
    for (const ext of extensions) {
      const indexPath = path.join(fullPath, `index${ext}`);
      try {
        if (fs.existsSync(indexPath)) {
          return {
            filePath: indexPath,
            type: 'sourceFile',
          };
        }
      } catch (e) {
        // Continue to next extension
      }
    }
  }
  
  // Fall back to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;