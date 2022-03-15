// Based on https://rsocket.io/guides/rsocket-js/#server-example

const { RSocketServer } = require('rsocket-core');
const RSocketWebSocketServer = require('rsocket-websocket-server');
const { Single } = require('rsocket-flowable');

const WebSocketTransport = RSocketWebSocketServer.default;
const host = '127.0.0.1';
const port = 7000;

const transportOpts = {
  host: host,
  port: port,
};

const transport = new WebSocketTransport(transportOpts);

const statuses = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

const getRequestHandler = (requestingRSocket, setupPayload) => {
  function handleRequestResponse(payload) {
    let status = statuses.PENDING;

    console.log(`requestResponse request:`, payload);

    return new Single((subscriber) => {
      function handleCancellation() {
        status = statuses.CANCELLED;
      }

      subscriber.onSubscribe(() => handleCancellation());

      /**
       * Leverage `setTimeout` to simulate a delay
       * in responding to the client.
       */
      setTimeout(() => {
        if (status === statuses.CANCELLED) {
          return;
        }
        // echo back datetime and payload to client
        let resp = {
          date: new Date(),
          payload: payload
        }
        console.log(`requestResponse response:`, resp);
        try {
          subscriber.onComplete({
            data: JSON.stringify(resp), // echo back json string
            metadata: null, // or new Buffer(...)
          });
        } catch (e) {
          subscriber.onError(e);
        }
      }, 100);
    });
  }

  return {
    requestResponse: handleRequestResponse,
  };
};

const rSocketServer = new RSocketServer({
  transport,
  getRequestHandler,
});

console.log(`Server starting on port ${port}...`);

rSocketServer.start();