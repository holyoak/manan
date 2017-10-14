'use strict';
const view = require('../view');

const getAccounts = require('./getAccounts');
const getClients  = require('./getClients');


module.exports = {
  init: init
}

function userInput() {
  return new Promise((resolve, reject) => {
    view.inputYesNo("Please enter Yes or No: ",resolve)
  });
}

function init(){
  return new Promise((resolve, reject) => {
   getClients()
     .then((data)=>{
      getAccounts(data, resolve);
     });
  });
}
