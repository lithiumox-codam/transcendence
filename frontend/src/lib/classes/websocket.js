import { browser } from "$app/environment";

/**
 * WebSocket manager class for handling connections and listeners.
 */
class WS {
	static instance = null;

	/**
	 * Creates an instance of WS.
	 */
	constructor() {
		if (WS.instance) {
			return WS.instance;
		}

		this.ws = null;
		this.listeners = [];
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
	 * Retrieves the access token from local storage.
	 * @returns {string|null} The access token, or null if not found.
	 */
	getToken() {
		if (browser) {
			return localStorage.getItem('access');
		}
		return null;
	}

	/**
	 * Establishes a WebSocket connection.
	 */
	connect() {
		if (this.ws) {
			return;
		}

		const token = this.getToken();
		this.ws = new WebSocket("wss://localhost/ws/", token ? ['access_token', token] : []);
		// console.log(token);

		this.ws.onopen = () => {
			console.log(this.ws);
			console.log('Connected to WS');
			if (this.connectionPromiseResolve) {
				this.connectionPromiseResolve();
				this.connectionPromiseResolve = null;
			}
		};

		this.ws.onclose = () => {
			this.ws = null;
			setTimeout(() => this.connect(), 10000);
		};

		this.ws.onmessage = (event) => {
			console.log('Received message:', event.data);
			try {
				const message = JSON.parse(event.data);
				if (message.stream && message.payload) {
					this.notifyListeners(message.stream, message.payload);
				} else {
					console.error('Invalid message format: \n(ex: { "stream": "x", "payload": {}}', message);
				}
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		};
	}

	/**
	 * Waits for the WebSocket connection to be open.
	 * @returns {Promise<void>} A promise that resolves when the connection is open.
	 */
	waitForConnection() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			this.connectionPromiseResolve = resolve;
		});
	}

	/**
	 * Sends a message through the WebSocket.
	 * @param {string} stream - The stream name.
	 * @param {Object} data - The data to send.
	 */
	send(stream, data) {
		this.waitForConnection().then(() => {
			this.ws.send(JSON.stringify({ stream, payload: data }));
		}).catch((error) => {
			console.error('Failed to send message:', error);
		});
	}

	/**
	 * Closes the WebSocket connection.
	 */
	close() {
		if (this.ws) {
			this.ws.close();
		}
	}

	/**
	 * Adds a listener for a specific stream.
	 * @param {string} stream - The stream name.
	 * @param {Function} listener - The listener function.
	 * @returns {Function} A function to remove the listener.
	 */
	addListener(stream, listener) {
		const id = (Math.random() + 1).toString(36).substring(7);
		this.listeners.push({ id, stream, listener });
		return () => this.removeListener(id);
	}

	/**
	 * Removes a listener by its ID.
	 * @param {string} id - The listener ID.
	 */
	removeListener(id) {
		this.listeners = this.listeners.filter(l => l.id !== id);
	}

	/**
	 * Notifies listeners of a specific stream with the given payload.
	 * @param {string} stream - The stream name.
	 * @param {Object} payload - The payload data.
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
	 * @returns {WS} The singleton instance.
	 */
	static getInstance() {
		if (!WS.instance) {
			WS.instance = new WS();
		}
		return WS.instance;
	}
}

const instance = WS.getInstance();
export default instance;