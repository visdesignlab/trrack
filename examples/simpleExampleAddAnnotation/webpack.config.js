const path = require('path');

module.exports = {
    entry: path.join(__dirname, '/src/provenanceSetup.ts'),
    output: {
        filename: 'bundle.js',
        path: __dirname
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};
