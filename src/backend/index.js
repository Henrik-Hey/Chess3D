const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const INITIAL_STATE = 'rnbqkbnr/1ppppppp/p7/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const sendInitialBoardState = (socket) => {
	socket.send(INITIAL_STATE);
}

const registerBoardChange = () => {

}

io.on('connection', socket => {

	// either with send()
	sendInitialBoardState(socket);

	// or with emit() and custom event names
	socket.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));
  
	// handle the event sent with socket.send()
	socket.on("message", (data) => {
	  console.log(data);
	});
  
	// handle the event sent with socket.emit()
	socket.on("salutations", (elem1, elem2, elem3) => {
	  console.log(elem1, elem2, elem3);
	});
});
server.listen(8080);