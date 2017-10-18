/* ES6, requires Node >= 6.11 */
'use strict';

// native node dependency
const rl = require('readline');
const input = rl.createInterface(process.stdin, process.stdout);

module.exports = {
  clearLines: clearLines,
  inputFromList: inputFromList,
  inputNumber: inputNumber,
  inputRange: inputRange,
  inputRaw: inputRaw,
  inputYesNo: inputYesNo,
  showAccounts: showAccounts,
  splash: splash
};

function clearLines(x){
  rl.moveCursor(process.stdout, 0, -x);
  rl.clearScreenDown(process.stdout);
}

function inputFromList(prompt, list, callback) {
  let i = 1;
  for(const e of list){
    console.log(i+". "+e);
    i++;
  }
  console.log(prompt)
  input.question("Enter the number of your selection: ", function(answer) {
    if(isNaN(answer) || answer<1 || answer>list.length){
      console.log("bad input");
      process.exit(0);
    }
    else {
      callback(answer)
    }
  });
}

function inputNumber (prompt, callback) {
  input.question(prompt, function(answer) {
    if(!isNaN(answer)){
      callback(answer);
    }
    else{
      rl.moveCursor(process.stdout, 0, -3);
      rl.clearScreenDown(process.stdout);
      console.log('Please enter a valid number');
      inputNumber (prompt, callback);
    }
  });
}

function inputRange (prompt, value, callback) {
    console.log("Enter numbers with a decimal or percentages with %");
    input.question(prompt, function(answer) {
      if(answer.indexOf('%')>-1){
        let percent = Number(answer.slice(0,-1));
        if(percent > 100 || percent < 1) {
          clearLines(4);
          console.log("Please enter a valid percentage");
          inputRange(prompt,value, callback);
        }
        else {
          callback(value*percent*0.01);
        }
      }
      else if(answer.indexOf('.')>-1){
        let amount = Number(answer);
        if(isNaN(amount)) {
          clearLines(3);
          console.log("Please enter a valid number");
          inputRange(prompt,value, callback);
        }
        else {
          callback(amount)
        }
      }
      else {
        clearLines(3);
        console.log("Please enter a valid range value");
        inputRange(prompt,value, callback);
      }
    });    
}

function inputRaw (prompt, callback) {
  input.question(prompt, function(answer) {
    callback(answer);
  });
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

function splash() {
  rl.cursorTo(process.stdout, 0, 0);
  rl.clearScreenDown(process.stdout);
  console.log("\n   Welcome to the future!\n")
  console.log("checking authorizations...")
}