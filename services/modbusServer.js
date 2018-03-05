const modbus  = require('jsmodbus');

const server = modbus.server.tcp.complete({ port : 8888 });

server.on('readCoilsRequest', function (start, quantity) {

	console.log('start =', start);
	console.log('quantity =', quantity)

});
