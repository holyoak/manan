/* ES6, requires Node >= 6.11 */
'use strict';

// lib dependencies
// cheating and using the easy way
const Gdax = require('gdax');

// local dependencies
const auth = require('../../auth.json');

module.exports = function (){
  return new Promise((resolve, reject) => {
// store exchanges available for session
    let exchanges = [];
    let client;
    let live_trading = false;
    
    for(const key of Object.keys(auth)){
// if keys, load client
      if(auth[key].key.slice(-3) != 'KEY') {
        console.log("Found keys for "+key);
        live_trading = true;
        client = new Gdax.AuthenticatedClient(auth[key].key, auth[key].secret, auth[key].passphrase, auth[key].url);
      }
// if no keys, load 'sandbox' as client
      else {
        client = 'sandbox';
      }
      exchanges.push({name: key, client:client});
    }
// final value of array is boolean flag for live trading
    exchanges.push(live_trading);
    resolve(exchanges);
  });
}
