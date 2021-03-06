const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const INITIAL_STATE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const sendInitialBoardState = (socket) => {
	socket.emit("initialize-board-state", INITIAL_STATE);
}

const handleBoardStateChange = (socket) => {
	socket.on("board-state-change", BoardState => {
		socket.emit("board-state-change", BoardState);
	})
}

io.on('connection', socket => {
	sendInitialBoardState(socket);
	handleBoardStateChange(socket);
});
server.listen(8080);