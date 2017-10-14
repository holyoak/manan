/* ES6, requires Node >= 6.11 */
'use strict';

const view = require('../view');


module.exports = {
	init:init
}

function init() {
  return new Promise(function (resolve, reject) {
    console.log("\nNo positions found\n");
    let prompt = 'Would you like to open a new position?\n'+
             '  [yes or no]:\n';
    view.inputYesNo(prompt, reduce);

    function reduce(x){
      if(x==true){
        resolve(createPosition());
      }
      else{
        process.exit(0);
      }
    }
  });
}

function createPosition(){
  console.log('into createPosition')
// select exchange
// 
// select market
// 
// select stake
// 
// select open price
// 
// select close price
// 
// select reversal
// 
// select split/no split
// 
// select portions
// 
// placeOrders()
  process.exit(0);
}
