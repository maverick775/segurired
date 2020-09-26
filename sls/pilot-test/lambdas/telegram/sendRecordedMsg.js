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
    //let answer = await sendBulkSMS(service, numbers, msg);
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