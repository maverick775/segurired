'use strict'
const fetch = require('node-fetch');

module.exports.getAtts = async (event,context) => {
    
  await fetch('http://ec2-3-101-90-91.us-west-1.compute.amazonaws.com:8080/api/v1/A2_TEST_TOKEN/attributes?sharedKeys=state')
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      console.log('*************************************************** ANSWER ****************************************');  
      console.log(myJson);
    });
    
};