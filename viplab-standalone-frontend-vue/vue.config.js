// vue.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const vtkChainWebpack = require("vtk.js/Utilities/config/chainWebpack");
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports =  {
    chainWebpack: config => {
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
            watchOptions: {
                poll: true,
                ignored: /node_modules/, // to make hot reload fast again
                //aggregateTimeout: 300,
                //poll: 300,
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                templateParameters: (compilation, assets, assetTags, options) => {
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
                template: 'src/assets/index.ejs'
            }),
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
            maxAssetSize: 10000000
        },
    },
}

/*
'digest': '590efa4ed7b6a0435d4dc36bdb48e4600742ed85252790b8e1a101a7a62a9204',
                        'test': 'eyJpZGVudGlmaWVyIjogIjExNDgzZjIzLTk1YmYtNDI0YS05OGE1LWVlNTg2OGM4NWMzZSIsICJtZXRhZGF0YSI6IHsiZGlzcGxheV9uYW1lIjogIkF1ZmdhYmUgMSIsICJkZXNjcmlwdGlvbiI6ICJTY2hyZWliZW4gU2llIGVpbmUgQy1GdW5rdGlvbi4uLiJ9LCAiZW52aXJvbm1lbnQiOiAiQyIsICJmaWxlcyI6IFt7ImlkZW50aWZpZXIiOiAiMjI0ODNmNDItOTViZi05ODRhLTk4YTUtZWU5NDg1Yzg1YzNlIiwgInBhdGgiOiAiY29kZS5jIiwgIm1ldGFkYXRhIjogeyJNSU1FdHlwZSI6ICJ0ZXh0L3BsYWluIiwgInN5bnRheEhpZ2hsaWdodGluZyI6ICJDIn0sICJwYXJ0cyI6IFt7ImlkZW50aWZpZXIiOiAicHJlYW1ibGUiLCAiYWNjZXNzIjogInZpc2libGUiLCAibWV0YWRhdGEiOiB7Im5hbWUiOiAiSW5mbzogc291cmNlIGJlZm9yZSB5b3VyIGNvZGUuIiwgImVtcGhhc2lzIjogImxvdyJ9LCAiY29udGVudCI6ICJJMmx1WTJ4MVpHVWdQSE4wWkdsdkxtZy1DZyJ9LCB7ImlkZW50aWZpZXIiOiAiY29kZUZyb21TdHVkZW50IiwgImFjY2VzcyI6ICJtb2RpZmlhYmxlIiwgIm1ldGFkYXRhIjogeyJuYW1lIjogIkZpbGwgaW4geW91ciBjb2RlISIsICJlbXBoYXNpcyI6ICJtZWRpdW0ifSwgImNvbnRlbnQiOiAiZG05cFpDQmlZWElvS1NCN0lDOHFJRk5qYUhKbGFXSmxiaUJUYVdVZ2FHbGxjaUJEYjJSbExDQmtaWElnSW1KaGNpSWdZWFZ6WjJsaWRDNGdLaThLQ24wSyJ9LCB7ImlkZW50aWZpZXIiOiAicG9zdHNjcmlwdCIsICJhY2Nlc3MiOiAidmlzaWJsZSIsICJtZXRhZGF0YSI6IHsibmFtZSI6ICJJbmZvOiBzb3VyY2UgYWZ0ZXIgeW91ciBjb2RlIGNhbGxpbmcgYmFyKCkgaW4gaXQuIiwgImVtcGhhc2lzIjogImxvdyJ9LCAiY29udGVudCI6ICJhVzUwSUcxaGFXNG9LU0I3SUdKaGNpZ3BPeUJ5WlhSMWNtNGdNRHNnZlEifV19XSwgInBhcmFtZXRlcnMiOiB7Il9fY2hlY2tib3hfXyI6IHsiZ3VpX3R5cGUiOiAiY2hlY2tib3giLCAibmFtZSI6ICJvcHRpb25zIiwgInZhbHVlcyI6IFsidmVyYm9zZSIsICJkZWJ1ZyIsICJtYWtlX3Bsb3QiXSwgInNlbGVjdGVkIjogWyJ2ZXJib3NlIl19LCAiX19yYWRpb0J1dHRvbl9fIjogeyJndWlfdHlwZSI6ICJyYWRpbyIsICJuYW1lIjogImJhY2tlbmQiLCAidmFsdWVzIjogWyJkZWJ1ZyIsICJzZXJpYWwiLCAiaHBjIiwgInRlc3QiXSwgInNlbGVjdGVkIjogInNlcmlhbCIsICJkaXNhYmxlZCI6IFsiaHBjIl19LCAiX19kcm9wZG93blNpbmdsZV9fIjogeyJndWlfdHlwZSI6ICJkcm9wZG93biIsICJuYW1lIjogIm1vZGVsIiwgInZhbHVlcyI6IFsiUGxlYXNlIGNob29zZSBvbmUiLCAiMXAiLCAiMXBuYyIsICIxcG5jbWluIiwgIjJwIiwgIjJwMWMiXSwgInNlbGVjdGVkIjogIjFwIiwgImRpc2FibGVkIjogWyJQbGVhc2UgY2hvb3NlIG9uZSJdLCAibXVsdGlwbGUiOiBmYWxzZX0sICJfX2Ryb3Bkb3duTXVsdGlwbGVfXyI6IHsiZ3VpX3R5cGUiOiAiZHJvcGRvd24iLCAibmFtZSI6ICJtb2RlbCIsICJ2YWx1ZXMiOiBbIlBsZWFzZSBjaG9vc2UgbXVsdGlwbGUiLCAiMXAiLCAiMXBuYyIsICIxcG5jbWluIiwgIjJwIiwgIjJwMWMiXSwgInNlbGVjdGVkIjogWyIxcCIsICIycCJdLCAiZGlzYWJsZWQiOiBbIlBsZWFzZSBjaG9vc2UgbXVsdGlwbGUiLCAiMnAxYyJdLCAibXVsdGlwbGUiOiB0cnVlfSwgIl9fdG9nZ2xlX18iOiB7Imd1aV90eXBlIjogInRvZ2dsZSIsICJuYW1lIjogIm9wdGlvbnMiLCAidmFsdWVzIjogWyJ2ZXJib3NlIiwgImRlYnVnIiwgIm1ha2VfcGxvdCJdLCAic2VsZWN0ZWQiOiBbInZlcmJvc2UiXX0sICJfX3NsaWRlclNpbmdsZV9fIjogeyJndWlfdHlwZSI6ICJzbGlkZXIiLCAibmFtZSI6ICJ0ZW1wZXJhdHVyZSIsICJ2YWx1ZSI6IDEwLCAibWluIjogMCwgIm1heCI6IDUwMCwgInN0ZXAiOiAxMCwgIm11bHRpcGxlIjogZmFsc2UsICJ2ZXJ0aWNhbCI6IGZhbHNlfSwgIl9fc2xpZGVyTXVsdGlwbGVfXyI6IHsiZ3VpX3R5cGUiOiAic2xpZGVyIiwgIm5hbWUiOiAidGVtcGVyYXR1cmUiLCAidmFsdWUiOiBbMjUsIDUwLCA3NV0sICJtaW4iOiAwLCAibWF4IjogMTAwLCAic3RlcCI6IDUsICJtdWx0aXBsZSI6IHRydWUsICJ2ZXJ0aWNhbCI6IHRydWV9LCAiX19pbnB1dFRleHRXTWF4bGVuZ3RoX18iOiB7Imd1aV90eXBlIjogImlucHV0X2ZpZWxkIiwgIm5hbWUiOiAiZmlsZV9uYW1lIiwgInR5cGUiOiAidGV4dCIsICJtYXhsZW5ndGgiOiAyMDB9LCAiX19pbnB1dFRleHRXT01heGxhbmd0aF9fIjogeyJndWlfdHlwZSI6ICJpbnB1dF9maWVsZCIsICJuYW1lIjogImZpbGVfbmFtZSIsICJ0eXBlIjogInRleHQifSwgIl9faW5wdXROdW1iZXJfXyI6IHsiZ3VpX3R5cGUiOiAiaW5wdXRfZmllbGQiLCAibmFtZSI6ICJ0aW1lX2RlbGF5IiwgInR5cGUiOiAibnVtYmVyIiwgInZhbHVlIjogMTAsICJtaW4iOiAwLCAibWF4IjogNTAwLCAic3RlcCI6IDAuMX0sICJfX2RlZmF1bHRKc29uX18iOiB7Im5hbWUiOiAiY29kZSAxIiwgImNvZGUiOiAiSTJsdVkyeDFaR1VnUEhOMFpHbHZMbWctQ2cifSwgIl9fZGVmYXVsdEphdmFfXyI6IHsibmFtZSI6ICJjb2RlIDIiLCAiY29kZSI6ICJkbTlwWkNCaVlYSW9LU0I3SUM4cUlGTmphSEpsYVdKbGJpQlRhV1VnYUdsbGNpQkRiMlJsTENCa1pYSWdJbUpoY2lJZ1lYVnpaMmxpZEM0Z0tpOEtDbjBLIn0sICJfX2dpdF9fIjogeyJndWlfdHlwZSI6ICJpbnB1dF9maWVsZCIsICJuYW1lIjogInN0ZXB3aWR0aCIsICJ0eXBlIjogIm51bWJlciIsICJ2YWx1ZSI6IDAuMDAxLCAibWluIjogMCwgIm1heCI6IDEsICJzdGVwIjogMC4wMDEsICJ2YWxpZGF0aW9uIjogInJhbmdlIn19LCAiY29uZmlndXJhdGlvbiI6IHsiY29tcGlsaW5nLmNvbXBpbGVyIjogImdjYyIsICJjb21waWxpbmcuZmxhZ3MiOiAiLU8yIC1XYWxsIiwgImNoZWNraW5nLnNvdXJjZXMiOiBbImNvZGVGcm9tU3R1ZGVudCJdLCAiY2hlY2tpbmcuZm9yYmlkZGVuQ2FsbHMiOiAic3lzdGVtIGV4ZWN2ZSIsICJsaW5raW5nLmZsYWdzIjogIi1sbSIsICJydW5uaW5nLmNvbW1hbmRMaW5lQXJndW1lbnRzIjogIi0tc3RlcHdpZHRoIHt7IF9fU1RFUFdJRFRIX18gfX0ifX0',
                        'token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiIsImtpZCI6Im15a2V5aWQifQ.eyJ2aXBsYWIuY29tcHV0YXRpb24tdGVtcGxhdGUuZGlnZXN0IjoiNTkwZWZhNGVkN2I2YTA0MzVkNGRjMzZiZGI0OGU0NjAwNzQyZWQ4NTI1Mjc5MGI4ZTFhMTAxYTdhNjJhOTIwNCIsImlzcyI6InRlc3QifQ.F_wrU0iIn8kFSg_4cc9jaPvifyxx89G_Nj52Aw76VKHtrbKyUAMHeN9MSMgENuKcJNCu2ghTwmfvrREL-RIs-wuGcuoB2Dg4EN-X7mp2djXEswzvw93hPNfkEvVYBNm30iMy2Cr3QosSI05-AeGf1JciusHBFNKpAh05xhh2FNfj8a40h6hZmgwjwBdH881mm9nDgQe9gi5IuUS_wDDk1ZKS2O4xPrdkp7dEgMIdxBwqZUYz6AOgK4KkM1_8P8YQOz8VVEj08LmmGFJxlE3FEJRzTlJoA3y-cjrFccVKojOT27UyNhprWKcaIypnEQTn4GlDvl7j15VCkvUaCW08rg',
                        
*/


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
