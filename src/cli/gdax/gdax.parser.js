//
// formats output from data socket for display to text buffer
//
"use strict";

const max_messages = 12;
const trades = [];

module.exports = {
  parse: parse
}

function parse(data){
  let trade = {
    side: data.side,
    price: Number(data.price).toFixed(2),
    size: Number(data.size).toFixed(4)
  }
  if(trade.side=='buy'){trade.label = 'sell '+trade.price+' '+trade.size;}
  else{ trade.label = ' buy '+trade.price+' '+trade.size;}
  if(trades.length>max_messages){let x = trades.shift();}
  trades.push(trade);
    //console.log(trade);
  return trades
}
