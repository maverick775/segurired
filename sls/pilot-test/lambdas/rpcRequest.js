'use strict'
const fetch = require('node-fetch');
const {getThingsAuth, getThingsAtt} = require('../utils');

module.exports.sendRPC = async (event,context) => {
  
  //This params should be passed from the event.
  let deviceId = '49934ed0-cb7e-11ea-bab3-ff8fe6e0c30b';
  let params = {
    "method": "desAl",
    "params": {}
  };
  //***********

  let credentials = {}; 
  try{
    credentials = await getThingsAuth();
  }catch(e){
    /*ERROR HANDLING SHOULD BE HERE,
      FOR EXAMPLE: TRYING TO REFRESH TOKEN
    */
  }
  let url = process.env.THINGS_URL + `api/plugins/rpc/twoway/${deviceId}`;
  let headers = {
    'Content-Type': 'application/json',
    'X-Authorization': 'Bearer '+ credentials.token
  };

  let opts = {
    method: 'post',
    headers: headers,
    body: JSON.stringify(params)
  }
  try{
    let response = await fetch(url, opts);
    console.log(response.status);
    console.log(response.JSON);
    //LOGIC TO HANDLE RESPONSE SHOULD BE HERE

    return response.json();
  }catch(e){
    console.error(e);
    
    //LOGIC TO HANDLE ERROR SHOULD BE HERE
  }
  
};