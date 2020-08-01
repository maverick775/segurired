import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
//import { sendTwiml } from "./utils";

import qs from "querystring";
import { getItem, updateItem } from "./dynamodb";
import {sendRPCRequest} from "./utils";

export const handler = async (event: APIGatewayEvent) => {
    const response = new twiml.VoiceResponse();
    const { Body, From } = qs.parse(event.body!);
    let user = await getItem({ TableName: 'registroAVP', Key: { numero: From as string } });
    if(user.Item) {
        response.say(
            {
                language: 'es-MX'
            },
            "Acceso restringido. Contacte a su representante."
        );
        let deviceId = '49934ed0-cb7e-11ea-bab3-ff8fe6e0c30b';
        let params = {
            "method": "actAl",
            "params": {}
        };
        let result =  await sendRPCRequest(deviceId, params);
        console.log(result);
    } else {
        let device  = await getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        if(!device.Item.activo){
            response.say(
                {
                    language: 'es-MX'
                },
                "Bienvenido a segurirred. Se activará la alarma"
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