const Gdax = require('gdax');

const websocket = new Gdax.WebsocketClient(['BTC-USD']);

websocket.on('message', data => {
  if(data.type == 'match'){
  	let trade = data.side+' size:'+data.size+' price:'+data.price;
  	console.log(trade);
  }
});
websocket.on('error', err => {
	console.log("ERROR"+data);
});
websocket.on('close', () => {
	console.log("CLOSED");
});