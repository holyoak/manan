/* ES6, requires Node >= 6.11 */
'use strict';

const createPosition = require('./createPosition')
const view = require('../view');


module.exports = {
	init:init
}

function init(data) {
  return new Promise(function (resolve, reject) {
    console.log("\nNo positions found\n");
    let prompt = 'Would you like to open a new position?\n'+
             '  [yes or no]:\n';
    view.inputYesNo(prompt, reduce);

    function reduce(x){
      if(x==true){
        resolve(createPosition(data));
      }
      else{
        process.exit(0);
      }
    }
  });
}
