/* ES6, requires Node >= 6.11 */
'use strict';

const view = require('../view')

const state = {}

module.exports = function (exchanges, resolve){

// short cut if there are no live exchanges
  state.live = exchanges.pop();
  if(!state.live){
    console.log('\nNo API keys were found\n')
    resolve(sandboxTrade(exchanges));
  }
  else {
// split into live and non live exchange arrays
    const live = [];
    const notLive = [];
    for(const e of exchanges) {
      if(e.client != 'sandbox') {
        console.log('Found API keys for '+e.name);
        live.push(
          new Promise(resolve => parser[e.name](e, resolve))
        );
      }
      else {
        notLive.push(e);
      }
    }

// get sandbox promises
    console.log("No keys found for "+notLive.map(e=>e.name).toString())
    const sandbox = new Promise(resolve => {resolve(sandboxTrade(notLive))});


// resolve all promises
    Promise.all(live)
      .then((data)=>{
        sandbox
        .then((sandboxBalances)=>{
          resolve(data.concat(sandboxBalances));
        })
      });
    }  
}



// TODO the parser needs to be split out into it's own module
// but lives here for now
const parser = {
  gdax: function (e, resolve) {
    console.log('getting balances for '+e.name+'...');
    e.client.getAccounts(smush);
    function smush(err, response, data){
      if(err) { console.log('ERROR '+err) ; }
      else{
        console.log('balances retrieved from '+e.name);
        e.balances = data;
        resolve(e);
      }
    }
  }
}


function sandboxTrade(exchanges){
  return new Promise(function (resolve, reject) {
    let prompt = 'Would you like to set up a sandbox account\n'+
               '  to test your trades? [yes or no]:\n';
    view.inputYesNo(prompt, reduce);
    function reduce(answer){
      if (answer == false) {
        if(state.live == true) {
          resolve();
        }
        else {
          console.log('Not much for me to do then');
          console.log('Enjoy the rest of the show');
          process.exit(0);
          resolve(null);
        }
      }
      else {
        const balances = setSandbox(exchanges);
        resolve(balances);
      }     
    }
  }); 
}



function setSandbox(exchanges){

// TODO this just a quick example
// this interface should allow the user to select
// any valid exchange or asset
  for(const e of exchanges) {
  	if(e.client == 'sandbox'){
  	  e.balances = [{
          "currency": "ETH",// change to 'asset' when parser breaks out
          "balance": "10",
          "available": "10"
      }];
  	}
  }
  return exchanges
} 
