module.exports = {
  presets: ["next/babel"],
  plugins: [
    ["module-resolver", {
      root: ["./src"],
      extensions: [".js", ".ts", ".tsx"],
    }]
  ]
};
