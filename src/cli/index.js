/* ES6, requires Node >= 6.11 */
'use strict';

// our own dependencies
const accounts = require('./accounts/index.js')
const positions = require('./positions')
const view = require('./view');

// store the session data
const State = {};
State.accounts = {};
State.positions = {};

// init app
function init(){
// set the initial view
  view.splash();
// auth & query runtime state of exchange balances
  accounts.init()
    .then((data)=>{
      State.accounts = data;
      view.showAccounts(data);
      positions.init(data);
      // showPositions(data);
    });
}
init();
