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
        API_URL: "http://localhost:4000/graphql"
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
        API_URL: "http://localhost:4000/graphql"
      })
    ]
  }
];
