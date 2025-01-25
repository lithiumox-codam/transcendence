import { browser } from "$app/environment";

class WS {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.listeners = [];
        this.retryInterval = 1000;
        this.maxRetries = 5;
        this.currentRetries = 0;
        this.connect();

        if (browser) {
            window.addEventListener('beforeunload', () => {
                this.close();
            });
        }
    }

    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('Connected to WS');
            this.currentRetries = 0;
        };

        this.ws.onclose = () => {
            console.log('Disconnected from WS');
            if (this.currentRetries < this.maxRetries) {
                setTimeout(() => {
                    this.currentRetries++;
                    this.connect();
                }, this.retryInterval);
            } else {
                console.log('Max retries reached. Could not reconnect.');
            }
        };

        this.ws.onmessage = (event) => {
            console.log(event);
            try {
                const message = JSON.parse(event.data);
                if (message.stream && message.payload) {
                    this.notifyListeners(message.stream, message.payload);
                } else {
                    console.error('Invalid message format: \n(ex: { "stream": "test", "payload": {}}', message);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
    }

    /**
     * Send a message to the WebSocket server
     * @param {string} stream The stream to send the message to (this will be used to route the message on the server)
     * @param {Object} data The payload to send to the server
     */
    send(stream, data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({stream, payload: data}));
        } else {
            console.error('WebSocket is not open. adding to buffer..');
        }
    }

    close() {
        this.ws.close();
    }

    /**
     * Adds a listener for a specific stream on the WebSocket server
     * @param {string} stream The stream to listen to
     * @param {Object} listener A function that will be called when a message is received on the stream
     */
    addListener(stream, listener) {
        this.listeners.push({stream, listener});
        console.log(this.listeners);
    }

    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    /**
     * This function will notify all listeners for a specific stream
     * @param {string} stream The stream to notify listeners for
     * @param {Object} payload The payload to send to the listeners
     */
    notifyListeners(stream, payload) {
        this.listeners.forEach(listener => {
            if (listener.stream === stream) {
                listener.listener(payload);
            }
        });
    }
}

const instance = new WS("wss://localhost/ws/");
export default instance;