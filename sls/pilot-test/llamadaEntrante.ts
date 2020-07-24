import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
//import { sendTwiml } from "./utils";

import qs from "querystring";
import { getItem, updateItem } from "./dynamodb";

export const handler = async (event: APIGatewayEvent) => {
    if (event.httpMethod.toLowerCase() === "post") {
        const { Body, From } = qs.parse(event.body!);
        const { Item } = await getItem({ TableName: 'registroAVP', Key: { numero: From as string } });
        // Twilio sent us a phone call, assumed to be gate buzzer box
        return handleCall(Item);
    } else {
        // Someone got here with a browser
        return {
            statusCode: 200,
            body:
                "Hello 👋, you probably don't want to be here"
        };
    }
};

async function handleCall(Item: any) {
    const response = new twiml.VoiceResponse();
    if (Item) {
        response.say(
            {
                voice: 'alice',
                language: 'es-MX'
            },
            "Bienvenido a segurired. Listo para activar"
        );
    } else {
        response.say(
            {
                voice: 'alice',
                language: 'es-MX'
            },
            "Acceso restringido. Contacte a su representante."
        );
    }
    // Steps to handle:
    // 1. Get caller from dynamoDB - hangup if not found message: "Acceso restringido"
    // 2. Get alarm state from second table - Prompt options
    // 3. Fetch response and prepare RPC actions (timeout)
    // 4. Enable recording
    // 5. Hangup before 1 minute. Send RPC to device. Update values.

    //response.hangup();
    const sendTwiml = (twiml: any) => {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/xml"
            },
            body: twiml.toString()
        };
    };
    return sendTwiml(response);
}