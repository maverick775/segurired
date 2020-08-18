import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
//import { sendTwiml } from "./utils";

import qs from "querystring";
import { getItem, updateItem } from "../../utils/dynamodb";

export const handler = async (event: APIGatewayEvent) => {
    const response = new twiml.VoiceResponse();
    const { Body, From } = qs.parse(event.body!);
    let caller;
    if(From){ 
        caller = From.slice(-10);
    }
    let user = await getItem({ TableName: 'registroAVP', Key: { numero: caller as string } });

    if(user.Item === undefined) {
        response.say(
            {
                language: 'es-MX'
            },
            "Acceso restringido. Contacte a su representante."
        );
    } else {
        let device  = await getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        //SUSTITUIR BUSQUEDA DE PARAMS EN DYNAMO POR BUSQUEDA EN TB
        if(device.Item === undefined){
            response.say(
                {
                    language: 'es-MX'
                },
                "No se encontró un dispositivo asociado a este número. Contacte a su administrador"
            );
            console.error(`El dispositivo ${user.Item.id} no se encontró en la base de datos`);
        }
        if(!device.Item.activo){
            let query = `?deviceId=${user.Item.id}&alerta=${device.Item.alerta}&run=activate`
            let gather = response.gather({
                input: 'dtmf',
                timeout: 10,
                numDigits: 1,
                action: 'https://jp0sa107zc.execute-api.us-west-1.amazonaws.com/auth-things/handleGather'+query
            });
            gather.say(
                {
                    language: 'es-MX'
                },
                "Bienvenido a segurirred. Presione uno para emergencia o dos para alerta"
            );
        } else {
            if(user.Item.tipo === "admin"){
                let query = `?deviceId=${user.Item.id}&alerta=${device.Item.alerta}&run=deactivate`
                let gather = response.gather({
                    input: 'dtmf',
                    timeout: 10,
                    numDigits: 1,
                    action: 'https://jp0sa107zc.execute-api.us-west-1.amazonaws.com/auth-things/handleGather'+query
                });
                gather.say(
                    {
                        language: 'es-MX'
                    },
                    "Alarma está activa, para desactivar presione 1"
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