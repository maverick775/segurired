import { APIGatewayEvent } from "aws-lambda";
import { getSecretValue } from "../../utils/secrets";
import { scanItems } from "../../utils/dynamodb";
import twilio from "twilio";

export const handler = async (event: APIGatewayEvent) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    let parsedBody = parseTwilioBody(event.body);
    let queryParams = event.queryStringParameters;
    let secretsAns = await getSecretValue("twilioAuthPake");
    let twilioCredentials = {
        // accountSid:'AC0218f5a303d490b5316f2eb7e3e57bee',
        // authToken: '2fc8efd83a1940e654bc81f64d692177'
    };
    if ('SecretString' in secretsAns) {
        twilioCredentials = JSON.parse(secretsAns.SecretString);
    } else {
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
}

const parseTwilioBody = (body: string | null) => {
    let pairsKeyValue = body?.split('&');
    if (pairsKeyValue) {
        let parsedBody = {};
        pairsKeyValue?.forEach((pair) => {
            let separated = pair.split('=');
            parsedBody[separated[0]] = separated[1];
        });
        return parsedBody;
    } else {
        throw new Error('El body pasado a parseTwilio fue incorrecto');
    }

}

const getDeviceRelatedNumbers = async (deviceId: string) => {
    let filterExpresion = '';
    let scanParams = {};
    let relatedRecords = await scanItems(scanParams);
    console.log(relatedRecords)
}

const sendBulkSMS = async (service: any, numbers: string[], msg: string) => {
    let bindings = numbers.map((number) => {
        return JSON.stringify({ binding_type: 'sms', address: number });
    });
    try{
        let twilioAns = await service.notifications.create({
            toBinding: bindings,
            body: msg
        });
        console.log(twilioAns);
        return {
            statusCode: 200,
            body: 'SENT'
        }
    }catch(e){
        console.error(e);
    }
    return {
        statusCode: 500,
        body: 'ERROR'
    }
}