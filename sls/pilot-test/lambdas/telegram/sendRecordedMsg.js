"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
exports.handler = async (event) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    let parsedBody = parseTwilioBody(event.body);
    let queryParams = event.queryStringParameters;
    //let secretsAns = await getSecretValue("twilioAPIAuth");
    let twilioCredentials = {
        accountSid: 'AC0218f5a303d490b5316f2eb7e3e57bee',
        authToken: '2fc8efd83a1940e654bc81f64d692177'
    };
    // if ('SecretString' in secretsAns) {
    //     twilioCredentials = secretsAns.SecretString;
    // } else {
    //     let buff = new Buffer(secretsAns.SecretBinary, 'base64');
    //     twilioCredentials = buff.toString('ascii');
    // }
    let client = require('twilio')(twilioCredentials.accountSid, twilioCredentials.authToken);
    let recordingURL = decodeURI(parsedBody.RecordingUrl);
    let msg = `Fulanito de tal activó la alarma y dejó el siguiente mensaje de voz: ${recordingURL}`;
    let targetNumber = queryParams.from.slice(-10);
    let twilioAnswer = await client.messages.create({
        body: msg,
        from: '+12058904188',
        to: `+521${targetNumber}`
    });
    console.log(twilioAnswer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZFJlY29yZGVkTXNnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VuZFJlY29yZGVkTXNnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdhLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLEVBQUU7SUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsSUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUM7SUFDOUMseURBQXlEO0lBQ3pELElBQUksaUJBQWlCLEdBQUc7UUFDcEIsVUFBVSxFQUFDLG9DQUFvQztRQUMvQyxTQUFTLEVBQUUsa0NBQWtDO0tBQ2hELENBQUM7SUFDRixzQ0FBc0M7SUFDdEMsbURBQW1EO0lBQ25ELFdBQVc7SUFDWCxnRUFBZ0U7SUFDaEUsa0RBQWtEO0lBQ2xELElBQUk7SUFDSixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFGLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEQsSUFBSSxHQUFHLEdBQUcsd0VBQXdFLFlBQVksRUFBRSxDQUFDO0lBQ2pHLElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0MsSUFBSSxZQUFZLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxJQUFJLEVBQUUsR0FBRztRQUNULElBQUksRUFBRSxjQUFjO1FBQ3BCLEVBQUUsRUFBRSxPQUFPLFlBQVksRUFBRTtLQUM1QixDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTFCLE9BQU87UUFDSCxVQUFVLEVBQUUsR0FBRztRQUNmLElBQUksRUFBRSxFQUFFO0tBQ1gsQ0FBQztBQUNOLENBQUMsQ0FBQTtBQUVELE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBbUIsRUFBRSxFQUFFO0lBQzVDLElBQUksYUFBYSxHQUFHLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckMsSUFBSSxhQUFhLEVBQUU7UUFDZixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDcEIsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzVCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxDQUFDLEVBQUU7UUFDSCxPQUFPLFVBQVUsQ0FBQztLQUNyQjtTQUFNO1FBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ2xFO0FBRUwsQ0FBQyxDQUFBIn0=