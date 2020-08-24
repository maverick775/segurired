import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";

// 4. Pause call
// 4.1 if call still going, tell visitor to try again

export const handler = async (event: APIGatewayEvent) => {
    const response = new twiml.VoiceResponse();
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const body = event.body;
    let parsedBody = parseGatherBody(body);
    console.log(parsedBody);

    response.say(
        {
            language: 'es-MX'
        },
        "Su mensaje fue grabado y será compartido con los demás miembros, hasta luego."
    );
    response.hangup();
    return sendTwiml(response);
}

const parseGatherBody = (body: string) => {
    let pairsKeyValue = body.split('&');
    let parsedBody = {};
    pairsKeyValue.forEach((pair) => {
        let separated = pair.split('=');
        parsedBody[separated[0]] = separated[1];
    });
    return parsedBody
}

const sendTwiml = (twiml: any) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml"
        },
        body: twiml.toString()
    };
};