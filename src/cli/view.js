/* ES6, requires Node >= 6.11 */
'use strict';

// native node dependency
const rl = require('readline');
const input = rl.createInterface(process.stdin, process.stdout);

module.exports = {
  inputYesNo: inputYesNo,
  showAccounts: showAccounts,
  splash: splash
};

function splash() {
  rl.cursorTo(process.stdout, 0, 0);
  rl.clearScreenDown(process.stdout);
  console.log("\n   Welcome to the future!\n")
  console.log("checking authorizations...")
}

function inputYesNo (prompt, callback) {
  input.question(prompt, function(answer) {
    answer = answer.toLowerCase();
    if(answer == 'yes' || answer == 'y') { callback(true); }
    else if(answer == 'no' || answer == 'n') { callback(false); }
    else { 
        rl.moveCursor(process.stdout, 0, -3);
        rl.clearScreenDown(process.stdout);
        console.log('Please enter a valid yes or no answer');
    	inputYesNo (prompt, callback); }
  });
}

function showAccounts(accounts){
  rl.cursorTo(process.stdout, 0, 0);
  rl.clearScreenDown(process.stdout);
  let prompt = '';
  let bal = '';
  let avl = '';
// sandbox 'no' response retruns a null object
  if (accounts[accounts.length-1] == null){accounts.pop();}
  for (const e in accounts) {
// display account title
    prompt = accounts[e].client == 'sandbox' ? '\nSandbox ' : '\nCurrent ';
    console.log(prompt+' statement for '+accounts[e].name+' account' )
// display header
    console.log( "Asset\t     Balance\t   Available")

    for (const a in accounts[e].balances) {
// the following uses 'currency'per gdax syntax, we want to use 'asset' once inside our parser
      let dec = a.currency == 'USD' ? 2 : 4;
      bal = String(Number(accounts[e].balances[a].balance).toFixed(dec));
      while(bal.length<12){bal = ' '+bal}
      avl = String(Number(accounts[e].balances[a].available).toFixed(dec));
      while(avl.length<12){avl = ' '+avl}
      console.log(accounts[e].balances[a].currency + "\t"+ bal + "\t" + avl) ;
    }
  }
}