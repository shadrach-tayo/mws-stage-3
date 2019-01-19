import replace from "rollup-plugin-replace";

export default [
  {
    input: "src/js/main.js",
    output: {
      file: "dist/js/main.js",
      format: "esm"
    },
    plugins: [
      replace({
        deliminters: ["{{", "}}"],
        PORT: 4000
      })
    ]
  },
  {
    input: "src/js/restaurant_info.js",
    output: {
      file: "dist/js/restaurant_info.js",
      format: "esm"
    },
    plugins: [
      replace({
        deliminters: ["{{", "}}"],
        PORT: 4000
      })
    ]
  }
];
