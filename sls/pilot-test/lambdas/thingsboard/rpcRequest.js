'use strict'
const fetch = require('node-fetch');
const {sendRPCRequest} = require('../../utils');

module.exports.sendRPC = async (event,context) => {
  //This params should be passed from the event.
  let deviceId = '49934ed0-cb7e-11ea-bab3-ff8fe6e0c30b';
  let params = {
    "method": "desAl",
    "params": {}
  };
  /***************************************************/
  
  let result = await sendRPCRequest(deviceId, params);
  return result;
};