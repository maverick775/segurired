import { APIGatewayEvent } from "aws-lambda";
import { getSecretValue } from "../../utils/secrets";

export const handler = async (event: APIGatewayEvent) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    let parsedBody = parseTwilioBody(event.body);
    let queryParams = event.queryStringParameters;
    //let secretsAns = await getSecretValue("twilioAPIAuth");
    let twilioCredentials = {
        accountSid:'AC0218f5a303d490b5316f2eb7e3e57bee',
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