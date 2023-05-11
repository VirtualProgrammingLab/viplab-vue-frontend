// vue.config.js
const vtkChainWebpack = require('vtk.js/Utilities/config/chainWebpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const fs = require('fs');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const Base64 = require('js-base64');

let inputTemplates;
let digest;
let dataTemplate;
let token;

module.exports = {
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        const argsLocal = args;
        argsLocal[0].templateParameters = (compilation, assets, assetTags, options) => ({
          compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options,
          },
          digest,
          dataTemplate,
          dataMode: 'create-and-execute',
          token,
          templates: inputTemplates,
        });
        argsLocal[0].template = 'src/assets/index.ejs';
        return argsLocal;
      });
    if (isProd) {
      config.optimization.minimizer('terser').tap((args) => [{ ...args[0], terserOptions: { compress: false }, exclude: /itk\/PolyDataIOs\/.*.js/ }]);
    }
    vtkChainWebpack(config);
  },
  // options...
  // the next 2 lines are needed, if you want to use the files in a flask app:
  // assetsDir: './assets',
  // indexPath: './templates/main.html',
  runtimeCompiler: true,
  pwa: {
    iconPaths: {
      favicon32: './favicon.png',
    },
  },
  configureWebpack: {
    devServer: {
      port: 8081,
      // https://github.com/vuejs-templates/webpack/issues/378
      watchFiles: {
        options: {
          usePolling: true,
          ignored: /node_modules/, // to make hot reload fast again
          // aggregateTimeout: 300,
          // poll: 300,
        },
      },
    },
    resolve: {
      alias: {
        handlebars: 'handlebars/dist/handlebars.min.js',
      },
      fallback: {
        path: require.resolve('path-browserify'),
        fs: false,
      },
    },
    plugins: [

      new CopyPlugin(
        {
          patterns: [
            {
              from: path.join(__dirname, 'node_modules', 'itk', 'WebWorkers'),
              to: path.join(__dirname, 'dist', 'js', 'itk', 'WebWorkers'),
            },
            /* {
                            from: path.join(__dirname, 'node_modules', 'itk', 'ImageIOs'),
                            to: path.join(__dirname, 'dist', 'itk', 'ImageIOs'),
                        }, */
            {
              from: path.join(__dirname, 'node_modules', 'itk', 'PolyDataIOs'),
              to: path.join(__dirname, 'dist', 'js', 'itk', 'PolyDataIOs'),
            },
            /* {
                            from: path.join(__dirname, 'node_modules', 'itk', 'MeshIOs'),
                            to: path.join(__dirname, 'dist', 'itk', 'MeshIOs'),
                        }, */
          ],
        },
      ),

    ],
    performance: {
      maxAssetSize: 100000000,
    },
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
};

function setParameters(filename) {
  // console.log(process.argv[3]);
  // console.log(process.env.VUE_APP_FILENAME);

  inputTemplates = fs.readdirSync('./src/input/');

  let usedFilename = filename;
  if (filename === '' || filename === null || filename === undefined) {
    usedFilename = inputTemplates[0].slice(0, -5);
  }

  const jwks = JSON.parse(fs.readFileSync('./src/assets/jwks.private.json'));
  const key = decodeURIComponent(jwkToPem(jwks.keys[0], { private: true }));

  // check is file exists, else use first file in input folder
  let file;
  try {
    file = fs.readFileSync(`./src/input/${usedFilename}.json`, 'utf8');
  } catch (err) {
    file = fs.readFileSync(`./src/input/${inputTemplates[0].slice(0, -5)}.json`, 'utf8');
  }

  // Read in content from additional file and convert to base64. Then add to content
  const json = JSON.parse(file);

  Object.keys(json.files).forEach((fileIndex) => {
    Object.keys(json.files[fileIndex].parts).forEach((partIndex) => {
      const currentPart = json.files[fileIndex].parts[partIndex];
      if (currentPart.access === 'template' && currentPart.content === '') {
        const contentFile = usedFilename.substring(0, usedFilename.indexOf('.') + 1);
        let content = '';
        try {
          content = fs.readFileSync(`./src/input/${contentFile}${currentPart.identifier}.txt`, 'utf8');
          currentPart.content = Base64.encode(Buffer.from(content).toString(), 'utf-8');
        } catch (err) {
          console.error(err);
        }
      }
    });
  });
  file = JSON.stringify(json);

  const dataBase64 = Base64.encode(Buffer.from(file).toString(), 'utf-8');
  const codeSha256 = CryptoJS.SHA256(dataBase64).toString(CryptoJS.enc.Hex);

  token = decodeURIComponent(jwt.sign({ 'viplab.computation-template.digest': codeSha256, 'viplab.digest-replaceable': true, iss: 'test' }, key, { algorithm: 'RS512', header: { kid: 'mykeyid' } }));

  digest = codeSha256;
  dataTemplate = dataBase64;

  // console.log(codeSha256);
  // console.log(dataBase64);
  // console.log("jwks: " + jwks);
  // console.log("private key: " + key);
  // console.log("public key: " + decodeURIComponent(jwkToPem(jwks['keys'][0])).concat('\n'));
  // console.log("codeSha256: " + codeSha256);
  // console.log("token: " + token);
}

setParameters(process.env.VUE_APP_FILENAME);
