var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

connection.onopen = function (session) {
  function marketEvent (args,kwargs) {
  	let i = 0;
  	while(i<args.length){
      if(args[i].type == 'newTrade'){
  	    let trade = args[i].data.type+' size:'+args[i].data.amount+' price:'+args[i].data.rate;
  	    console.log(trade);
  	  }
    i++;
    }
  }		
  session.subscribe('USDT_BTC', marketEvent);
}

connection.onclose = function () {
  console.log("Websocket connection closed");
}
		       
connection.open();