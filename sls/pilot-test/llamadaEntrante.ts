import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
//import { sendTwiml } from "./utils";

import qs from "querystring";
import { getItem, updateItem } from "./dynamodb";

export const handler = async (event: APIGatewayEvent) => {
    const { Body, From } = qs.parse(event.body!);
    const response = new twiml.VoiceResponse();
    var user = await getItem({ TableName: 'registroAVP', Key: { numero: From as string } });
    //let item
    if(user){
        var device  = await getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        if(!device.Item.activo){
            response.say(
                {
                    language: 'es-MX'
                },
                "Bienvenido a segurirred. Listo para activar"
            );
        }else{
            response.say(
                {
                    language: 'es-MX'
                },
                "Alarma activa. Confirme desactivacion."
            );
        }
    } else {
        response.say(
            {
                language: 'es-MX'
            },
            "Acceso restringido. Contacte a su representante."
        );
    }
    return sendTwiml(response);
    
};

const sendTwiml = (twiml: any) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml"
        },
        body: twiml.toString()
    };
};