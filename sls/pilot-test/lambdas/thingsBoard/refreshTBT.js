'use strict'
const utils = require('../../utils');

module.exports.refreshTBToken = async (event, context) => {
    try{
        let currTokens = await utils.getThingsTBTokensFromSecrets();
        let newTokens = {};
        if(currTokens.status !== 'OK'){
            newTokens = await utils.getNewAuthTokensTB();
        }else{
            try{
                newTokens = await utils.refreshAccessTokenTB(JSON.parse(currTokens.data));
            }catch(e){
                newTokens = await utils.getNewAuthTokensTB();
            }
        }
        let params = {
            AccessTokenTB: newTokens.token, 
            RefreshTokenTB: newTokens.refreshToken
        }
        console.log(params);
        let answer = await utils.updateTBTokensInSecrets(params);
        if(answer.status !== 'OK'){
            throw new Error(answer.data);
        }
        return {
            statusCode: 200,
            body: "Actualización exitosa"
        };
    }catch(e){
        console.log('Token could not be updated')
        console.error(e);
        return {
            statusCode: 500,
            body: "Hubo un error"
        };
    }
};