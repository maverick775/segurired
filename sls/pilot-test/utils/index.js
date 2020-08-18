'use strict'
const fetch = require('node-fetch');
const { getSecretValue, putSecretValue } = require('./secrets');

const getThingsTBTokensFromSecrets = async () => { 
    //THIS FUNCTION SHOULD BE CHANGED SO JUST HANDLE WHETHER TO GET A REFRESHED ACCESS TOKEN OR A WHOLE NEW TOKEN
    try {
        let data = await getSecretValue("TB/RPCAuth");
        let secret = '';
        if ('SecretString' in data) {
            secret = data.SecretString;
        } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            secret = buff.toString('ascii');
        }
        return {
            status: 'OK',
            data: secret
        } 
    }catch(e){
        console.error(e);
        return {
            status: 'ERROR',
            data: e
        }
    }
}

const updateTBTokensInSecrets = async (newTokens) => {
    //HERE SHOULD BE CODE TO CALL TB AND REFRESH TB TOKEN
    console.log('Los tokens que llegaron a la funcion son: ');
    console.log(newTokens);
    if(typeof newTokens.AccessTokenTB === 'string' && typeof newTokens.RefreshTokenTB === 'string'){
        let putSecretsValues = {
            SecretId: "TB/RPCAuth",
            SecretString: JSON.stringify(newTokens)
        };
        try{
            let newSecrets = await putSecretValue(putSecretsValues);
            return {
                status: 'OK',
                data: newSecrets
            }
        }catch(e){
            console.error('Tokens could not be updated in Secrets Manager');
            console.error(e);
            return {
                status: 'ERROR',
                data: e
            };
        }
    }else{
        console.error('One of the tokens passed to this function is missing, please check your passed parameters.');
        return {
            status: 'ERROR',
            data: new Error('One of the tokens passed to this function is missing, please check your passed parameters.')
        }
    }
}

const refreshAccessTokenTB = async(currTokens) => {
    if(typeof currTokens.AccessTokenTB === 'string' && typeof currTokens.RefreshTokenTB === 'string'){
        var accessToken = 'Bearer ' + currTokens.AccessTokenTB;
        var refreshToken = currTokens.RefreshTokenTB;
    }else{
        throw new Error('One of the tokens passed to this function is missing, please check your passed parameters.');
    }
    //HERE SHOULD BE CODE TO GET NEW TOKEN AND REFRESH TOKEN IN CASE REFRESH TOKEN EXPIRES
    let url = 'http://ec2-3-101-90-91.us-west-1.compute.amazonaws.com:8080/api/auth/token';
    let headers = {'Content-Type': 'application/json', 'X-Authorization': accessToken};
    let params = {
        "refreshToken":refreshToken
    };
    let opts = {
        method: 'post',
        headers: headers,
        body: JSON.stringify(params)
    };
    let response = await fetch(url, opts);
    return response.json();
}

const getNewAuthTokensTB = async() => {
    //HERE SHOULD BE CODE TO GET NEW TOKEN AND REFRESH TOKEN IN CASE REFRESH TOKEN EXPIRES
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
        let answer = await getThingsTBTokensFromSecrets();
        if(answer.status === 'OK'){
            credentials = answer.data;
        }else{
            throw new Error(answer.data);
        }
    }catch(e){
        let answer = await getNewAuthTokensTB();
        let credentials = {
            AccessTokenTB: answer.data.token, 
            RefreshTokenTB: answer.data.refreshToken
        }
        await updateTBTokensInSecrets(credentials);
    }
    let url = process.env.THINGS_URL + `api/plugins/rpc/twoway/${deviceId}`;
    let headers = {
        'Content-Type': 'application/json',
        'X-Authorization': 'Bearer '+ credentials.AccessTokenTB
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
    //REGRESAR UN ERROR PORQUE NO SE PUDO COMPLETAR LA SOLICITUD
}

module.exports={
    getThingsTBTokensFromSecrets,
    updateTBTokensInSecrets,
    refreshAccessTokenTB,
    getNewAuthTokensTB,
    getThingsAtt,
    sendRPCRequest
}