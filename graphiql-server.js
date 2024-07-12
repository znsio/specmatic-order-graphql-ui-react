const http = require('http');
const { parse } = require('url');

// Serve GraphiQL interface
const serveGraphiQL = (res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GraphiQL</title>
      <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
    </head>
    <body style="margin: 0;">
      <div id="graphiql" style="height: 100vh;"></div>
      <script
        crossorigin
        src="https://unpkg.com/react/umd/react.production.min.js"
      ></script>
      <script
        crossorigin
        src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
      ></script>
      <script
        crossorigin
        src="https://unpkg.com/graphiql/graphiql.min.js"
      ></script>
      <script>
        const graphQLFetcher = graphQLParams =>
          fetch('http://localhost:8080/graphql', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphQLParams),
          })
          .then(response => response.json())
          .catch(() => response.text());

        ReactDOM.render(
          React.createElement(GraphiQL, { fetcher: graphQLFetcher }),
          document.getElementById('graphiql'),
        );
      </script>
    </body>
    </html>
  `);
};

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url, true);

  if (pathname === '/graphiql') {
    serveGraphiQL(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(4000, () => {
  console.log('Server is running at http://localhost:4000/graphiql');
});