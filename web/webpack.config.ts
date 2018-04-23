import * as WebpackDevServer from "webpack-dev-server";
import * as Webpack from "webpack";
import * as path from "path";
import "dotenv/config";

function rel(relativePath: string) {
    return path.join(__dirname, relativePath);
}

const devServerConfig: WebpackDevServer.Configuration = {
    contentBase: rel("public/"),
    historyApiFallback: true,
    stats: "minimal",
    overlay: true
};

const config: Webpack.Configuration = {
    mode: "development",
    entry: {
        index: rel("src/main/index.ts"),
        styles: rel("src/main/styles.ts")
    },
    output: {
        publicPath: "dist/",
        path: rel("public/dist/"),
        filename: "[name].js"
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.vue$/, loader: "vue-loader" },
            { test: /\.css$/, use: ["vue-style-loader", "css-loader"] },
            { test: /\.(png|jpg|gif|svg)$/, loader: "file-loader", options: { name: "[name].[ext]?[hash]" } },
            { test: /\.(ttf|woff|woff2|eot|otf)$/, loader: "file-loader", options: { name: "[name].[ext]?[hash]" } }
        ]
    },
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.esm.js",
            "@main": rel("src/main/"),
            "@scripts": rel("src/scripts/"),
            "@components": rel("src/components/"),
            "@css": rel("src/css/"),
            "api": rel("../api")
        },
        extensions: ["*", ".js", ".ts", ".vue", ".json"]
    },
    plugins: [
        new Webpack.DefinePlugin({
            BASE_URL: JSON.stringify(process.env.BASE_URL)
        })
    ],
    devServer: devServerConfig,
    devtool: "cheap-module-source-map"
};

export default config;
