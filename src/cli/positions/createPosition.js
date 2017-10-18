/* ES6, requires Node >= 6.11 */
'use strict';

const exchanges = require('../../exchanges');
const view = require('../view');

function createPosition(data){
      // console.log("data is "+JSON.stringify(data));
  const position = {};
  selectExchange(data)
    .then(selectMarket)
    .then(selectAsset)
    .then(selectStake)
    .then(selectOpenPrice)
    .then(selectClosePrice)
    .then(selectAutoReversal)
    .then(selectSplit)
    .then(confirm)
    .then(buildOrder)
    .then(placeOrder);

  function selectExchange(data){
    return new Promise(function (resolve, reject) {
      const exchanges = data.map((e) => e.name);
      if (exchanges.length>1){
        view.clearLines(5);
        console.log("Opening new position\n")
        let prompt = "Which exchange would you like to use?"
        view.inputFromList(prompt, exchanges, (answer)=>{
          position.exchange = exchanges[answer-1];
          view.clearLines(Number(exchanges.length+4))
          resolve(position);
        });
      }
      else if(exchanges.length==1){
        view.clearLines(2);
        position.exchange = exchanges[0];
        resolve(position);
      }
      else{
        console.error("No exchanges sent to createPosition")
        process.exit(0);
      }
    });
  }

  function selectMarket(position){
    return new Promise(function (resolve, reject) {
      console.log("Opening position on "+position.exchange+"\n");
      let markets = require('../../exchanges')[position.exchange].markets;
      const balances = data.reduce((curr, next)=>{
        if(next.name == position.exchange) {curr = next.balances;}
        return(curr);
      }, []);
      const available = balances.map((e)=>{
        if(e.available>0.0001){return(e.currency);}
      });

      markets = markets.filter((e)=>{
        if(available.indexOf(e.base)>-1 || available.indexOf(e.quote)>-1)
          {return(e);}
      });
      let prompt = "Which market would you like to use?";
      let labels = markets.map((e)=> e.symbol);
      view.inputFromList(prompt, labels, (answer)=>{
        position.market = markets[answer-1];
        view.clearLines(Number(markets.length+4));
        resolve(position);
      });
    });
  }

  function selectAsset(position){
    return new Promise(function (resolve, reject) {
      console.log("Opening "+position.market.symbol+" position on "+position.exchange+"\n");
      // get available assets for this exchange
      let available = data.filter(e=>e.name==position.exchange);
      // filter for assets on this market
      available = available[0].balances.filter(e=>e.currency==position.market.base || e.currency==position.market.quote);
// HACK WARNING!
// the .01 value below is the min value considered 'available'
// the actual value varies widely across markets
// some USD amounts MUST be .xx, while most altcoins go to .xxxxxxxx
// specific market minimums may also apply, e.g. GDAX will not accept BTC maker bids below .01
// for now, to be safe, .01 because it is functional everywhere
      available = available.filter(e=>e.available>.01);
      if(available.length>1){
        // simpler to allow multiple positions per market 
        // rather than trying to 'merge' opposing positions
        let prompt = "Which asset would you like to use?";
        let labels = available.map(e=>e.currency)
        view.inputFromList(prompt, labels, (answer)=>{
          position.stake = {
            "name": available[answer-1].currency,
            "available": available[answer-1].available
          };
          view.clearLines(Number(labels.length+2));
          resolve(position);
        });
      }
      else{
        position.stake = { 
          "name": available[0].currency,
          "available": available[0].available
        };
        view.clearLines(2);
        resolve(position);
      }
    });    
  }

  function selectStake(p){
    return new Promise(function (resolve, reject) {
      p.stake.pair = p.market.base == p.stake.pair ? p.market.quote : p.market.base;
      console.log("Selling "+p.stake.name+" on "+p.exchange+" for "+p.stake.pair+"\n");
      console.log("You have "+p.stake.available+" "+p.stake.name+" available\n");
      let prompt = "How much would you like to use for this position? ";
      view.inputNumber(prompt, (answer)=>{
        p.stake.amount = answer;
        view.clearLines(5);
        resolve(p);
      });
    });
  }

  function selectOpenPrice(position){
    return new Promise(function (resolve, reject) {
      position.stake.pair = position.stake.asset == position.market.base ? position.market.quote : position.market.base;
      console.log("Selling "+position.stake.amount+" "+position.stake.name+" on "+position.exchange+" for "+position.stake.pair+"\n");
      let prompt = "What price would you like to open at? ";
      view.inputNumber(prompt, (answer)=>{
        position.openPrice = answer;
        view.clearLines(3);
        resolve(position);
      });
    });
  }

  function selectClosePrice(position){
    return new Promise(function (resolve, reject) {
      console.log("Selling "+position.stake.amount+" "+position.stake.name+
        " at "+position.openPrice+" on "+position.exchange+" for "+position.stake.pair+"\n");
      let prompt = "What price would you like to close at? ";
      view.inputNumber(prompt, (answer)=>{
        if(Number(position.openPrice)>Number(answer)){
          console.log("Not gonna help you lose money");
      console.log("answer is "+answer);
      console.log("position is "+JSON.stringify(position));

          process.exit(0);
        }
        else{
          view.clearLines(3);
          position.closePrice = answer;
          resolve(position);
        }
      });
    });
  }

  function selectAutoReversal(position){
    return new Promise(function (resolve, reject) {
      console.log("Selling "+position.stake.amount+" "+position.stake.name+
        " at "+position.openPrice+" on "+position.exchange+" for "+position.stake.pair+
        " and closing at "+position.closePrice+"\n");
      let prompt = "Would you like to auto reverse the position after closing? ";
      view.inputYesNo(prompt, (answer)=>{
        position.autoReverse = answer;
        resolve(position);
      });
    });
  }

  function selectSplit(position){
    return new Promise(function (resolve, reject) {
      let prompt = "Would you like to split the position into portions? ";
      view.inputYesNo(prompt, (answer)=>{
        if(answer!=true){
          position.split = false;
          view.clearLines(1);
          resolve(position);
        }
        else {
          selectPortions(resolve);
        }
      });
    });
  }

  function selectPortions(resolve){
    let prompt = "How many portions would you like? [max 10] ";
    view.inputNumber(prompt, (answer)=>{
      if(answer>10){
        console.log("Max 10 portions allowed");
        selectPortions(resolve);
      }
      else{
        position.split = {portions:answer};
        view.clearLines(1);
        selectRange(resolve);
      }
    });
  }

  function selectRange(resolve){
    view.clearLines(1);
    console.log("Position being split into "+position.split.portions+" orders\n");
    let prompt = "What range should the portions cover? ";
    view.inputRange(prompt, position.openPrice, (answer)=>{
      view.clearLines(4);
      console.log("Position split into "+position.split.portions+" orders in a range of "+answer+"\n");
      position.split.range = answer;
      resolve(position);
    });
  }

  function confirm(position){
    return new Promise(function (resolve, reject) {
      let prompt = "\nReady to open this position? "
      view.inputYesNo(prompt, (answer)=>{
        if(answer==false){
          console.log("Good call, that was a poor position");
          process.exit(0);
        }
        else{
          resolve(position);
        }
      });
    });    
  }

  function buildOrder(){
    return new Promise(function (resolve, reject) {
      let orders = [];

      console.log("Market is "+JSON.stringify(position.market))
      console.log("\nposition is "+JSON.stringify(position))

      // if position asset is base side of market
      if(position.market.base==position.stake.name){
        if(position.split==false) {
          orders.push(
            {
              'price': position.openPrice,
              'size': Number(position.stake.amount).toFixed(2), // hard coded for GDAX xxx/USD, the most stringent case
              'product_id': position.market.id
            }
          );
        }
        else{
          let bottom = Number(position.openPrice - (position.split.range/2)).toFixed(6);
          let step = Number(position.split.range/(position.split.portions -1)).toFixed(6);
          let i = 0;
          while(i<position.split.portions){
            orders.push(
                {
                  'size': Number(position.stake.amount/position.split.portions).toFixed(6),
                  'price': Number(bottom).toFixed(2), // hard coded for GDAX xxx/USD, the most stringent case
                  'product_id': position.market.id
                }
            );
            bottom = Number(bottom)+Number(step);
            // hack to protect against rounding errors
            bottom = Number(bottom).toFixed(5);
            i++;
          }
        }
        orders.push('sell')
        resolve(orders);
      }
      // asset is quote side of market
      else{
        if(position.split==false){
          orders.push(
            {
              'price': position.openPrice,
              'size': Number(position.stake.amount/position.openPrice).toFixed(2), // hard coded for GDAX xxx/USD, the most stringent case
              'product_id': position.market.id
            }
          );
          resolve(orders);
        }
        else{
          let bottom = Number(position.openPrice - (position.split.range/2)).toFixed(6);
          let step = Number(position.split.range/(position.split.portions -1)).toFixed(6);
          let i = 0;
          while(i<position.split.portions){
            orders.push(
                {
                  'size': Number(position.stake.amount/position.openPrice/position.split.portions).toFixed(6),
                  'price': Number(bottom).toFixed(6), // hard coded for GDAX xxx/USD, the most stringent case
                  'product_id': position.market.id
                }
            );
            bottom = Number(bottom)+Number(step);
            // hack to protect against rounding errors
            bottom = Number(bottom).toFixed(5);
            i++;
          }
        }
        orders.push('buy')
        resolve(orders);
      }
    });
  }

  function placeOrder(orders){
    const flag = orders.pop();


    // console.log("data is "+JSON.stringify(data));
    console.log("\norders is "+JSON.stringify(orders));
    // process.exit(0);
    if(flag=='sell'){
      return new Promise(function (resolve, reject) {
        let i = 0;
        while(i<orders.length){
          data[0].client.sell(orders[i], confirmOrders);
          i++;
        }
      });
    }

    if(flag=='buy'){
      return new Promise(function (resolve, reject) {
        let i = 0;
        while(i<orders.length){
          data[0].client.buy(orders[i], confirmOrders);
          i++;
        }
      });
    }

    // 
  }

  function confirmOrders(err, response, data){
    if(err) { console.log('ERROR '+err) ; }
    else {
      console.log("Order response is "+JSON.stringify(data))
    }
  }
}

module.exports = createPosition;
