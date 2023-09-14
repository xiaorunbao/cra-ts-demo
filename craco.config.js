// @ts-nocheck
const { whenProd } = require('@craco/craco');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const StyledComponentsPlugin = require('babel-plugin-styled-components');
const CracoAntDesignPlugin = require('craco-antd');
const cssnano = require('cssnano');
const mockServer = require('./mock/mock-server');

const isProduction = process.env.NODE_ENV === 'production';

const useMock = process.argv[2] === '--mock';

module.exports = {
  eslint: {
    mode: 'file',
  },
  style: {
    postcss: {
      plugins: (plugins) => whenProd(() => [...plugins, cssnano], []),
    },
  },
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          '@primary-color': '#1890ff',
        },
      },
    },
    {
      plugin: StyledComponentsPlugin,
      options: {
        displayName: !isProduction,
        fileName: false,
        pure: true,
        ssr: false,
      },
    },
  ],
  devServer: (devSeverConfig) => {
    return {
      ...devSeverConfig,
      onBeforeSetupMiddleware: function (devServer) {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        if (useMock) {
          mockServer(devServer.app);
        }
      },
    };
  },
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        const instanceOfMiniCssExtractPlugin = webpackConfig.plugins.find(
          (plugin) => plugin instanceof MiniCssExtractPlugin
        );

        instanceOfMiniCssExtractPlugin.options.ignoreOrder = true;
      }

      return webpackConfig;
    },
  },
};
