import { browser } from "$app/environment";

/**
 * WebSocket manager class for handling connections and listeners.
 */
class WS {
    /**
     * Singleton instance of the WS class. This is used to ensure that only one instance of the WS class is created.
     * @type {WS|null}
     */
    static instance = null;

    /**
     * Creates an instance of the WS class.
     * @param {string} url - The WebSocket server URL.
     */
    constructor(url) {
        if (WS.instance) {
            console.log('Returning existing WS instance');
            return WS.instance;
        }

        console.log('Creating new WS instance');

        /**
         * @type {string}
         */
        this.url = url;
        /**
         * @type {WebSocket|null}
         */
        this.ws = null;
        /**
         * @type {Array<{id: string, stream: string, listener: (payload: Object) => void}>}
         */
        this.listeners = [];
        /**
         * @type {number}
         */
        this.retryInterval = 1000;
        /**
         * @type {number}
         */
        this.maxRetries = 5;
        /**
         * @type {number}
         */
        this.currentRetries = 0;
        this.connect();

        if (browser) {
            window.addEventListener('beforeunload', () => {
                this.close();
                this.ws = null;
            });
        } 

        WS.instance = this;
    }

    /**
     * Establishes a WebSocket connection and sets up event handlers.
     */
    connect() {
        if (this.ws) {
            console.log('WebSocket is already active.');
            return;
        }

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
                    console.log('Reconnecting... ', this.currentRetries, ' retries');
                    this.connect();
                }, this.retryInterval);
            } else {
                console.log('Max retries reached. Could not reconnect.');
            }
        };

        this.ws.onmessage = (event) => {
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
     * Sends a message through the WebSocket connection.
     * @param {string} stream - The stream identifier.
     * @param {Object} data - The payload to send.
     */
    send(stream, data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({stream, payload: data}));
        } else {
            console.error('WebSocket is not open. Could not send message.');
        }
    }

    /**
     * Closes the WebSocket connection.
     */
    close() {
        this.ws.close();
    }

    /**
     * Adds a listener for a specific stream. And returns a function to remove the listener.
     * @param {string} stream - The stream identifier.
     * @param {(payload: Object) => void} listener - The callback function to handle messages.
     * @returns {() => void} A function to remove the listener.
     */
    addListener(stream, listener) {
        const id = (Math.random() + 1).toString(36).substring(7);
        this.listeners.push({id, stream, listener});
        return () => this.removeListener(id);
    }

    /**
     * Removes a listener.
     * @param {string} id - The unique identifier of the listener to remove.
     */
    removeListener(id) {
        this.listeners = this.listeners.filter(l => l.id !== id);
    }

    /**
     * Notifies listeners of a specific stream with the given payload.
     * @param {string} stream - The stream identifier.
     * @param {Object} payload - The payload to pass to the listeners.
     */
    notifyListeners(stream, payload) {
        this.listeners.forEach(listener => {
            if (listener.stream === stream) {
                listener.listener(payload);
            }
        });
    }

    /**
     * Gets the singleton instance of the WS class.
     * @param {string} url - The WebSocket server URL.
     * @returns {WS} The singleton instance of the WS class.
     */
    static getInstance(url) {
        if (!WS.instance) {
            WS.instance = new WS(url);
        }
        return WS.instance;
    }
}

const instance = WS.getInstance(`wss://localhost/ws/`);
export default instance;