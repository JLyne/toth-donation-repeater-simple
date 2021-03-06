const net = require('net');
const io = require('socket.io-client');

let clients = {};
let lastEvent = null;

const server = net.createServer(c => {
	console.log('Server: Client connected');

	//Prevents clients from staying connected and never receiving new donations, rather than falling back to HTTP
	if(!client.connected) {
		c.disconnect();
	}

	clients[c.__fd] = c;

	if(lastEvent) {
		c.write(JSON.stringify(lastEvent));
	}

	c.on('end', () => {
		console.log('Server: Client disconnected');
		delete clients[c.__fd];
	});

	c.on('error', error => {
		console.log('Server: Client error', error);
		delete clients[c.__fd];
	});

	c.pipe(c);
});

server.listen(process.env.PORT || 3000, () => {
	console.log('Server: Listening');
});

const client = io.connect('https://toth-donation-socket-repeater.herokuapp.com/', {reconnect: true});

// Add a connect listener
client.on('connect', function(socket) {
	console.log('Client: Connected to repeater');
});

client.on('donation', function(data) {
	lastEvent = data;

	console.log("Client: Donation", data);

	for(let client in clients) {
		if(clients.hasOwnProperty(client)) {
			clients[client].write(JSON.stringify(data));
		}
	}
});

client.on('disconnect', (reason) => {
	if (reason === 'io server disconnect') {
		client.connect();
	}

	//Prevents clients from staying connected and never receiving new donations, rather than falling back to HTTP
	for(let client in clients) {
		if(clients.hasOwnProperty(client)) {
			clients[client].disconnect();
		}
	}
});
