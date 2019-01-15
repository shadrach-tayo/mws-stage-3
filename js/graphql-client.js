class GraphQLClient {
  constructor(baseURI, options = {}) {
    this.url = baseURI;
    this.options = Object.assign({}, options, {
      method: "POST",
      header: {
        "content-type": "application/json"
      }
    });
  }

  request(query, variables = {}) {
    const f = fetch("http://localhost:4000/graphql", {
      method: "POST",
      body: JSON.stringify({
        query,
        variables
      }),
      headers: { "content-type": "application/json" }
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        if (!res.error && res.data) {
          return res;
        } else {
          return res.error;
        }
      });

    return f;

    // const response = fetch(
    //   this.url,
    //   Object.assign({}, this.options, {
    //     body: JSON.stringify({ query, variables })
    //   })
    // )
    //   .then(res => {
    //     console.log(res);
    //     return res.json();
    //   })
    //   .then(r => console.log(r))
    //   .catch(err => {
    //     console.log(err);
    //   });
  }
}
