'use strict';

const getAccounts = require('./getAccounts');
const getClients  = require('./getClients');


module.exports = {
  init: init
}

function init(){
  return new Promise((resolve, reject) => {
   getClients()
     .then((data)=>{
      getAccounts(data, resolve);
     });
  });
}
