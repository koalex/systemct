/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

'use strict';

global.__DEVELOPMENT__      = process.env.NODE_ENV === 'development';
const webpack		        = require('webpack');
const config                = require('config');
const path                  = require('path');
const join                  = path.join;
const pkg                   = require('./package.json');
const ExtractTextPlugin     = require('extract-text-webpack-plugin');
const AssetsPlugin          = require('assets-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const BrowserSyncPlugin     = require('browser-sync-webpack-plugin');
const WriteFilePlugin       = require('write-file-webpack-plugin');
// const ZopfliPlugin          = require('zopfli-webpack-plugin');
const CompressionPlugin     = require('compression-webpack-plugin');
const autoprefixer          = require('autoprefixer');


module.exports = {
  devtool: __DEVELOPMENT__ ? 'eval' : 'source-map',
  devServer: {
    historyApiFallback: true
  },
  context: join(config.projectRoot, './client'),
  entry: {
    common: __DEVELOPMENT__ ? ['react-hot-loader/patch', 'webpack-hot-middleware/client', './common.js'] : ['./common.js'],
    index:  __DEVELOPMENT__ ? ['react-hot-loader/patch', 'webpack-hot-middleware/client', './index']     : ['./index.js']
  },
  output: {
    path: path.resolve(__dirname, './public'),
    publicPath: '/',
    filename: __DEVELOPMENT__ ? '[name].js' : '[hash:6].js',
    //library: '[name]',
    chunkFilename: __DEVELOPMENT__ ? '[id].js' : '[id].[chunkhash:6].js'
  },
  watchOptions: {
      aggreagateTimeout: 100
  },
  resolve: {
    modules: ['node_modules', 'bower_components'],
    alias: {

    },
    extensions: ['.js', '.jsx', '.less', '.styl', '.scss']
  },
  resolveLoader: {
    modules: ['node_modules', 'bower_components'],
    extensions: ['.js', '.jsx', '.less', '.styl', '.scss']
  },
  performance: {
    hints: false,
    maxEntrypointSize: 400000,
    maxAssetSize: 250000,
    assetFilter: function (assetFilename) { return !(/\.map$/.test(assetFilename)); }
  },
  module: {
    noParse: [/jquery/],
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
            presets: [['es2015', { 'modules': false }], 'stage-0', 'react'],
            plugins: ['transform-runtime', 'transform-decorators-legacy', 'react-hot-loader/babel'],
            
          }
      },
      {
        test: /\.css$/,
        // FIXME: change 'loader' to 'use' after fix -> https://github.com/webpack/extract-text-webpack-plugin/issues/297
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                minimize: !__DEVELOPMENT__,
                modules: false,
                importLoaders: 1

              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer({ browsers: ['> 5%'] })]
              }
            }
          ]
        })
      },
      {
        test: /\.less?$/,
        // FIXME: change 'loader' to 'use' after fix -> https://github.com/webpack/extract-text-webpack-plugin/issues/297
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                minimize: !__DEVELOPMENT__,
                modules: true,
                importLoaders: 1

              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer({ browsers: ['> 5%'] })]
              }
            },
            'less-loader'
          ]
        })
      },
      {
        test: /\.scss$/,
        // FIXME: change 'loader' to 'use' after fix -> https://github.com/webpack/extract-text-webpack-plugin/issues/297
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                minimize: !__DEVELOPMENT__,
                modules: true,
                importLoaders: 1

              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer({ browsers: ['> 5%'] })]
              }
            },
            'sass-loader'
          ]
        })
      },
      {
        test: /\.styl$/,
        // FIXME: change 'loader' to 'use' after fix -> https://github.com/webpack/extract-text-webpack-plugin/issues/297
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                minimize: !__DEVELOPMENT__,
                modules: true,
                importLoaders: 1

              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer({ browsers: ['> 5%'] })]
              }
            },
            'stylus-loader'
          ]
        })

      },
      {
        test: /\.(png|jpg|jpeg|svg|ttf|eot|woff|woff2)$/i,
        use: [
          {
            loader: 'url-loader',
            query: {
              name: (__DEVELOPMENT__ ? '[path][name]' : '[path][name].[hash:6]') + '.[ext]',
              limit: 4096
            }
          },
          {
            loader: 'image-webpack-loader',
            query: {
              mozjpeg: {
                progressive: true
              },
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 7
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    // new webpack.optimize.OccurrenceOrderPlugin(),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NamedModulesPlugin(),

    new ExtractTextPlugin({ filename: __DEVELOPMENT__ ? '[name].css' : '[contenthash:8].css', allChunks: true, disable: __DEVELOPMENT__ }),

    new webpack.ContextReplacementPlugin(/(\/node_modules\/moment\/locale|\/bower_components\/moment\/locale)/, /ru|en-gb/),

    new FaviconsWebpackPlugin({
      logo: __DEVELOPMENT__ ? join(config.projectRoot, './client/assets/img/logo_300x300.png') : join(config.projectRoot, './client/assets/img/logo_600x600.png'),
      prefix: '[hash:6]/[hash:6].[ext]', // 'favicons-[hash:7]/[hash:7].[ext]'
      emitStats: true,
      statsFilename: 'favicons.json',
      background: '#fff',
      title: pkg.name,
      appName: pkg.name,
      appDescription: pkg.description,
      developerName: pkg.author.name,
      developerURL: pkg.author.url,
      index: pkg.homepage,
      url: pkg.homepage,
      silhouette: false,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: true,
        favicons: true,
        firefox: true,
        opengraph: true,
        twitter: true,
        yandex: true,
        windows: true
      }
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: __DEVELOPMENT__ ? '[name].js': '[hash:8].js',
      minChunks: Infinity
    }),

    new webpack.DefinePlugin({
      __DEVELOPMENT__: JSON.stringify(__DEVELOPMENT__)
    }),

    new AssetsPlugin({
      filename: 'assets.json',
      path: config.publicRoot
    })
  ]
};


if (__DEVELOPMENT__) {
  module.exports.plugins.push(
      new BrowserSyncPlugin(
          {
            ui: {
              port: 8090
            },
            host: 'localhost',
            port: 8080,
            // proxy the Webpack Dev Server endpoint
            // (which should be serving on http://localhost:8080/)
            // through BrowserSync
            cors: false,
            proxy: {
              target: 'http://localhost:' + config.port,
              ws: true
            }
          },
          {
            // prevent BrowserSync from reloading the page
            // and let Webpack Dev Server take care of this
            reload: false
          }
      )
  );
  module.exports.plugins.push(
      new WriteFilePlugin({
        test: /favicons\.json$/,
        useHashIndex: true
      })
  );
}

if (!__DEVELOPMENT__) {
  module.exports.plugins.push(
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$/,
        minRatio: 0.8
      })
  );
  /*module.exports.plugins.push(
      new ZopfliPlugin({
        asset: '[path].gz[query]',
        algorithm: 'zopfli',
        test: /\.js$|\.css$/,
        // threshold: 10240,
        minRatio: 0.8
      })
  );*/
  module.exports.plugins.push( // NO NEED IF -p in CLI
      new webpack.optimize.UglifyJsPlugin({
        test: /\.js$/,
        // exclude: /common\.js/, // ебаный баг заставляет писать костыли https://github.com/webpack/webpack/issues/1079
        compress: {
          warnings: false,
          drop_console: true,
          unsafe: true
        }
      })
  );
}