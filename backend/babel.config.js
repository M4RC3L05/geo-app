module.exports = {
    presets: ["@babel/env", "@babel/typescript"],
    plugins: [
        "@babel/plugin-transform-runtime",
        [
            "module-resolver",
            {
                extensions: [".js", ".ts", ".tsx"],
                root: ["./src"],
            },
        ],
    ],
}
