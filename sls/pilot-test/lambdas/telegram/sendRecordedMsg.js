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
    let numbers = await getDeviceRelatedNumbers(queryParams === null || queryParams === void 0 ? void 0 : queryParams.deviceId);
    let answer = await sendBulkSMS(service, numbers, msg);
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
    var _a;
    let deviceData = await dynamodb_1.getItem({ TableName: 'alarmas', Key: { id: deviceId } });
    let numbers = (_a = deviceData.Item) === null || _a === void 0 ? void 0 : _a.smsContacts;
    return numbers;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFJlY29yZGVkTXNnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VuZFJlY29yZGVkTXNnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlEQUFxRDtBQUNyRCxtREFBK0M7QUFHbEMsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQXNCLEVBQUUsRUFBRTtJQUNwRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxJQUFJLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxNQUFNLHdCQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN4RCxJQUFJLGlCQUFpQixHQUFHO0lBQ3BCLG1EQUFtRDtJQUNuRCxnREFBZ0Q7S0FDbkQsQ0FBQztJQUNGLElBQUksY0FBYyxJQUFJLFVBQVUsRUFBRTtRQUM5QixpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUMzRDtTQUFNO1FBQ0gsSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6RCxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztLQUMxRDtJQUNELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUYsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEUsSUFBSSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELElBQUksR0FBRyxHQUFHLHdFQUF3RSxZQUFZLEVBQUUsQ0FBQztJQUNqRyxJQUFJLE9BQU8sR0FBRyxNQUFNLHVCQUF1QixDQUFDLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxRQUFRLENBQUMsQ0FBQztJQUNuRSxJQUFJLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFcEIsT0FBTztRQUNILFVBQVUsRUFBRSxHQUFHO1FBQ2YsSUFBSSxFQUFFLEVBQUU7S0FDWCxDQUFDO0FBQ04sQ0FBQyxDQUFBO0FBRUQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFtQixFQUFFLEVBQUU7SUFDNUMsSUFBSSxhQUFhLEdBQUcsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQyxJQUFJLGFBQWEsRUFBRTtRQUNmLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDNUIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsRUFBRTtRQUNILE9BQU8sVUFBVSxDQUFDO0tBQ3JCO1NBQU07UUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7S0FDbEU7QUFFTCxDQUFDLENBQUE7QUFFRCxNQUFNLHVCQUF1QixHQUFHLEtBQUssRUFBRSxRQUFnQixFQUFFLEVBQUU7O0lBQ3ZELElBQUksVUFBVSxHQUFJLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRixJQUFJLE9BQU8sU0FBRyxVQUFVLENBQUMsSUFBSSwwQ0FBRSxXQUFXLENBQUM7SUFDM0MsT0FBTyxPQUFPLENBQUE7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLE9BQVksRUFBRSxPQUFpQixFQUFFLEdBQVcsRUFBRSxFQUFFO0lBQ3ZFLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNsQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSTtRQUNBLElBQUksU0FBUyxHQUFHLE1BQU0sT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7WUFDL0MsU0FBUyxFQUFFLFFBQVE7WUFDbkIsSUFBSSxFQUFFLEdBQUc7U0FDWixDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU87WUFDSCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxNQUFNO1NBQ2YsQ0FBQTtLQUNKO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTztRQUNILFVBQVUsRUFBRSxHQUFHO1FBQ2YsSUFBSSxFQUFFLE9BQU87S0FDaEIsQ0FBQTtBQUNMLENBQUMsQ0FBQSJ9