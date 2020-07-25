'use strict'

module.exports.getAtts = async event => {
  fetch('http://ec2-3-101-90-91.us-west-1.compute.amazonaws.com:8080/api/v1/A1_TEST_TOKEN/attributes?sharedKeys=active')
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      console.log(myJson);
    });
};

