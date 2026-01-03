module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@shared': './src/shared',
            '@features': './src/features',
            '@assets': './assets',
            '@components': './components',
            '@context': './context',
            '@constants': './constants',
            '@hooks': './hooks',
            '@scripts': './scripts',
            '@utils': './utils',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};