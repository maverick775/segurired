"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const secrets_1 = require("../../utils/secrets");
const dynamodb_1 = require("../../utils/dynamodb");
exports.handler = async (event) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    let parsedBody = parseTwilioBody(event.body);
    let queryParams = event.queryStringParameters;
    let secretsAns = await secrets_1.getSecretValue("twilioAuthPake");
    let twilioCredentials = {
    // accountSid:'AC0218f5a303d490b5316f2eb7e3e57bee',
    // authToken: '2fc8efd83a1940e654bc81f64d692177'
    };
    if ('SecretString' in secretsAns) {
        twilioCredentials = JSON.parse(secretsAns.SecretString);
    }
    else {
        let buff = new Buffer(secretsAns.SecretBinary, 'base64');
        twilioCredentials = JSON.parse(buff.toString('ascii'));
    }
    let client = require('twilio')(twilioCredentials.accountSid, twilioCredentials.authToken);
    let service = client.notify.services(twilioCredentials.notifyServiceID);
    let recordingURL = decodeURIComponent(parsedBody.RecordingUrl);
    let msg = `Fulanito de tal activó la alarma y dejó el siguiente mensaje de voz: ${recordingURL}`;
    //THESE NUMBERS SHOULD BE OBTAINED WITH SCAN ON DYNAMODB
    let numbers = ['+5213315209069', '+5213316011536'];
    let answer = await sendBulkSMS(service, numbers, msg);
    //let targetNumber = queryParams.from.slice(-10);
    // let twilioAnswer = await client.messages.create({
    //     body: msg,
    //     from: '+12058904188',
    //     to: `+521${targetNumber}`
    // });
    console.log(answer);
    return {
        statusCode: 200,
        body: {}
    };
};
const parseTwilioBody = (body) => {
    let pairsKeyValue = body === null || body === void 0 ? void 0 : body.split('&');
    if (pairsKeyValue) {
        let parsedBody = {};
        pairsKeyValue === null || pairsKeyValue === void 0 ? void 0 : pairsKeyValue.forEach((pair) => {
            let separated = pair.split('=');
            parsedBody[separated[0]] = separated[1];
        });
        return parsedBody;
    }
    else {
        throw new Error('El body pasado a parseTwilio fue incorrecto');
    }
};
const getDeviceRelatedNumbers = async (deviceId) => {
    let filterExpresion = '';
    let scanParams = {};
    let relatedRecords = await dynamodb_1.scanItems(scanParams);
    console.log(relatedRecords);
};
const sendBulkSMS = async (service, numbers, msg) => {
    let bindings = numbers.map((number) => {
        return JSON.stringify({ binding_type: 'sms', address: number });
    });
    try {
        let twilioAns = await service.notifications.create({
            toBinding: bindings,
            body: msg
        });
        console.log(twilioAns);
        return {
            statusCode: 200,
            body: 'SENT'
        };
    }
    catch (e) {
        console.error(e);
    }
    return {
        statusCode: 500,
        body: 'ERROR'
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFJlY29yZGVkTXNnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VuZFJlY29yZGVkTXNnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlEQUFxRDtBQUNyRCxtREFBaUQ7QUFHcEMsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQXNCLEVBQUUsRUFBRTtJQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxJQUFJLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxNQUFNLHdCQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN4RCxJQUFJLGlCQUFpQixHQUFHO0lBQ3BCLG1EQUFtRDtJQUNuRCxnREFBZ0Q7S0FDbkQsQ0FBQztJQUNGLElBQUksY0FBYyxJQUFJLFVBQVUsRUFBRTtRQUM5QixpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUMzRDtTQUFNO1FBQ0gsSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6RCxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUMxRDtJQUNELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUYsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMs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