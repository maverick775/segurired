import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
//import { sendTwiml } from "./utils";

import qs from "querystring";
import { getItem, updateItem } from "./dynamodb";

export const handler = async (event: APIGatewayEvent) => {
    const response = new twiml.VoiceResponse();
    const { Body, From } = qs.parse(event.body!);
    let user = await getItem({ TableName: 'registroAVP', Key: { numero: From as string } });
    if(typeof user.Item === 'undefined') {
        response.say(
            {
                language: 'es-MX'
            },
            "Acceso restringido. Contacte a su representante."
        );
    } else {
        let device  = await getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        if(!device.Item.activo){
            response.say(
                {
                    language: 'es-MX'
                },
                "Bienvenido a segurirred. Listo para activar"
            );
        } else {
            if(user.Item.tipo === "admin"){
                response.say(
                    {
                        language: 'es-MX'
                    },
                    "Alarma activa. Confirme desactivacion."
                );
            } else {
                response.say(
                    {
                        language: 'es-MX'
                    },
                    "Alarma activa. Contacte a su representante para desactivar."
                );
            }
        }
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