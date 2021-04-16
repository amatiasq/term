const { createServer } = require("http");
const telnet = require('telnet-client');
const { Server } = require("ws");

const port = process.env.PORT || 17965;
const server = createServer();
const wss = new Server({ server });

server.listen(port, () => console.log(`Websocket server ready at ${port}`));

wss.on('connection', (ws, req) => {
  const conn = new telnet();

  ws.on('close', () => telnet.close());

  ws.on('message', msg => {
    const data = parseJson(msg);

    if (data.type = 'CONNECT') {
      conn.connect({

      });
    }
  });

  conn.on('connect', () => send({type: 'CONNECTED'}));

  function send(data) {
    ws.send(JSON.stringify(data));
  }
});

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Invalid JSON:', text);
    return INVALID_JSON;
  }
}
