'use strict'
const fetch = require('node-fetch');

const getThingsAuth = async () => {
    let url = 'http://ec2-3-101-90-91.us-west-1.compute.amazonaws.com:8080/api/auth/login';
    let headers = {'Content-Type': 'application/json'};
    let params = {
        "username":"tenant@thingsboard.org", 
        "password":"tenant"
    };
    let opts = {
        method: 'post',
        headers: headers,
        body: JSON.stringify(params)
    };
    let response = await fetch(url, opts);
    return response.json();
}

// let wantedAttributes = {
//     sharedKeys: ['active']
// };
// let atts = await getThingsAtt('A1_TEST_TOKEN', wantedAttributes);
const getThingsAtt = async (deviceToken, attributes) =>{
    let route = `${process.env.THINGS_URL}api/v1/${deviceToken}/`
    let query = 'attributes?';
    let attKeys = Object.keys(attributes);
    for(let i=0; i<attKeys.length; i++){
        let key = attKeys[i];
        if(key === 'sharedKeys' || key === 'clientKeys'){
            if(!Array.isArray(attributes[key])){
                console.error('Params of ' + key + ' are not array');
                return new Error('Params of ' + key + ' are not array');
            }
            let params = key + '=' + attributes[key].join(',');
            query += params+'&';
        }
    }

    let url = route + query;
    let response = await fetch(url);
    return response.json();
}

const sendRPCRequest = async (deviceId, params)=> { 
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
        let status = response.status;
        let resBody = response.json();
        //LOGIC TO HANDLE RESPONSE SHOULD BE HERE

    return {
        status: status,
        body: resBody
    }
    }catch(e){
        console.error(e);

        //LOGIC TO HANDLE ERROR SHOULD BE HERE
    }
}

module.exports={
    getThingsAuth,
    getThingsAtt,
    sendRPCRequest
}