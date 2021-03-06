const auth = require('../../auth');
const GdaxStream = require('../../streams/gdax');
let gdaxSocket ={};

if( auth.gdax.key == "GDAX_KEY") {
  gdaxSocket = new GdaxStream(
    ['BTC-USD'],
    'wss://ws-feed.gdax.com'
  );
}
else {
  gdaxSocket = new GdaxStream(
    ['BTC-USD'],
    'wss://ws-feed.gdax.com',
    {
      key: auth.gdax.key,
      secret: auth.gdax.secret,
      passphrase: auth.gdax.passphrase,
    }
  );	
}


gdaxSocket.on('error', err => {
	console.log("GDAX SOCKET ERROR"+err);
});
gdaxSocket.on('close', () => {
	console.log("GDAX SOCKET CLOSED");
});

module.exports = exports = gdaxSocket;