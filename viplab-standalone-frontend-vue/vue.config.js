// vue.config.js
const vtkChainWebpack = require("vtk.js/Utilities/config/chainWebpack");
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const isProd = process.env.NODE_ENV === "production"


module.exports =  {
    chainWebpack: config => {
      config
      .plugin('html')
      .tap(args => {
        args[0].templateParameters = (compilation, assets, assetTags, options) => {
                    return {
                        compilation,
                        webpackConfig: compilation.options,
                        htmlWebpackPlugin: {
                            tags: assetTags,
                            files: assets,
                            options
                        },
                        'digest': digest,
                        'dataTemplate': dataTemplate,
                        'dataMode': "create-and-execute",
                        'token': token,
                        'templates': inputTemplates
                    };
                },
                args[0].template = 'src/assets/index.ejs'
        return args;
      })
      if(isProd) {
        config.optimization.minimizer("terser").tap(args => [{...args[0], terserOptions: {compress: false}, exclude:  /itk\/PolyDataIOs\/.*.js/ }])
      }
      vtkChainWebpack(config);
    },
    // options...
    //the next 2 lines are needed, if you want to use the files in a flask app:
    //assetsDir: './assets',
    //indexPath: './templates/main.html',
    runtimeCompiler: true,
    pwa: {
        iconPaths: {
            favicon32: './favicon.png',
        }
    },
    configureWebpack: {
        devServer: {
            port: 8081,
            // https://github.com/vuejs-templates/webpack/issues/378
            watchFiles: {
                options: {
                    usePolling: true,
                    ignored: /node_modules/, // to make hot reload fast again
                    //aggregateTimeout: 300,
                    //poll: 300,
		},
            },
        },
    resolve: {
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js'
        },
        fallback: {
            path: require.resolve("path-browserify"),
            fs: false,
        },
    },
    plugins: [

        new CopyPlugin(
                {
                    patterns: [
                        {
                            from: path.join(__dirname, 'node_modules', 'itk', 'WebWorkers'),
                            to: path.join(__dirname, 'dist','js', 'itk', 'WebWorkers'),
                        },
                        /*{
                            from: path.join(__dirname, 'node_modules', 'itk', 'ImageIOs'),
                            to: path.join(__dirname, 'dist', 'itk', 'ImageIOs'),
                        },*/
                        {
                            from: path.join(__dirname, 'node_modules', 'itk', 'PolyDataIOs'),
                            to: path.join(__dirname, 'dist', 'js', 'itk', 'PolyDataIOs'),
                        },
                        /*{
                            from: path.join(__dirname, 'node_modules', 'itk', 'MeshIOs'),
                            to: path.join(__dirname, 'dist', 'itk', 'MeshIOs'),
                        },*/
                    ]
                }),

        ],
        performance: {
            maxAssetSize: 100000000
        },
    },
}

var fs = require('fs');
var jwkToPem = require("jwk-to-pem");
var jwt = require("jsonwebtoken");
var CryptoJS = require("crypto-js");
const Base64 = require('js-base64');

var inputTemplates;
var digest;
var dataTemplate;
var token;

var setParameters = function (filename) {

    //console.log(process.argv[3]);
    //console.log(process.env.VUE_APP_FILENAME);

    inputTemplates = fs.readdirSync('./src/input/');

    if (filename === "" || filename === null || filename === undefined) {
        filename = inputTemplates[0].slice(0, -5);
    }

    var jwks = JSON.parse(fs.readFileSync('./src/assets/jwks.private.json'));
    var key = decodeURIComponent(jwkToPem(jwks['keys'][0], { private: true }));

    //check is file exists, else use first file in input folder
    var file = null;
    try {
        file = fs.readFileSync("./src/input/" + filename + ".json", 'utf8')
    } catch (err) {
        file = fs.readFileSync("./src/input/" + inputTemplates[0].slice(0, -5) + ".json", 'utf8')
    }

    // Read in content from additional file and convert to base64. Then add to content
    var json = JSON.parse(file);
    for (var fileIndex in json.files) {
        for (var partIndex in json.files[fileIndex].parts) {
            var currentPart = json.files[fileIndex].parts[partIndex];
            if (currentPart.access === "template") { //&& currentPart.content === "") {
                var contentFile = filename.substring(0, filename.indexOf(".") + 1);
                var content = "";
                try {
                    content = fs.readFileSync("./src/input/" + contentFile + currentPart.identifier + ".txt", 'utf8');
                    currentPart.content = Base64.encode(Buffer.from(content).toString(), "utf-8");
                } catch (err) {
                    // console.log(err);
                    content = "";
                    // continue searching for files
                    continue;
                }
            }
        }
    }
    file = JSON.stringify(json);

    var dataBase64 = Base64.encode(Buffer.from(file).toString(), "utf-8");
    var codeSha256 = CryptoJS.SHA256(dataBase64).toString(CryptoJS.enc.Hex);

    token = decodeURIComponent(jwt.sign({ 'viplab.computation-template.digest': codeSha256, 'viplab.digest-replaceable': true, 'iss': 'test' }, key, { algorithm: 'RS512', header: { "kid": "mykeyid" } }));

    digest = codeSha256;
    dataTemplate = dataBase64;

    //console.log(codeSha256);
    //console.log(dataBase64);
    //console.log("jwks: " + jwks);
    //console.log("private key: " + key);
    //console.log("public key: " + decodeURIComponent(jwkToPem(jwks['keys'][0])).concat('\n'));
    //console.log("codeSha256: " + codeSha256);
    //console.log("token: " + token);
}

setParameters(process.env.VUE_APP_FILENAME);
