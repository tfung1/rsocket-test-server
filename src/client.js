const { RSocketClient } = require('rsocket-core');
const RSocketWebsocketClient = require('rsocket-websocket-client').default;
const WebSocket = require('ws');

async function createClient(options) {
    const transportOptions = {
        url: `ws://${options.host}:${options.port}`,
        // In non-browser environments we need to provide a
        // factory method which can return an instance of a
        // websocket object. Browsers however, have this
        // functionality built-in.
        wsCreator: (url) => {
            return new WebSocket(url);
        }
    };
    const setupOptions = {
        keepAlive: 1000000,
        lifetime: 100000,
        dataMimeType: 'text/plain',
        metadataMimeType: 'text/plain'
    };
    const transport = new RSocketWebsocketClient(transportOptions);
    const client = new RSocketClient({ setup: setupOptions, transport });
    return client.connect();
}

async function run(metadata, data) {
    const rsocket = await createClient({
        host: '127.0.0.1',
        port: 7000,
    });

    function reject(error) {
        console.error("failed:", error)
    }
    function resolve(data) {
        console.info("success:", data)
    }

    rsocket.requestResponse({
        data:JSON.stringify(data),
        metadata: metadata,
    })
        .subscribe({
            onComplete: data => {
                const res = JSON.parse(data.data);
                console.info("response", res)
                resolve(data.data);
            },
            onError: error => {
                reject(error);
            },
        });
}

// Call start
(async() => {
    await run("myMetdata", "myData");
})();