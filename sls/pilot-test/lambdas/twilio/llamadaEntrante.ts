import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";

import qs from "querystring";
import { getItem, updateItem } from "../../utils/dynamodb";
import { getThingsAtt } from "../../utils";

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
        if(device.Item === undefined){
            response.say(
                {
                    language: 'es-MX'
                },
                "No se encontró un dispositivo asociado a este número. Contacte a su administrador"
            );
            console.error(`El dispositivo ${user.Item.id} no se encontró en la base de datos`);
        }
        let neededParams = {
            sharedKeys: ['Triggered','Emergency'],
            clientKeys:['Bateria']
        }
        try{
            var currParams = await getThingsAtt(device.Item.token, neededParams);
            console.log('Current Device Parameters ');
            console.log(currParams);
        }catch(e){
            console.error('Los parámetros no pudieron ser obtenidos de TB a continuación se muestra el error: ');
            console.error(e);
            var currParams = {
                shared: {
                    Triggered: device.Item?.Triggered 
                },
                client: {

                }
            }
        }
        
        if(!currParams.shared.Triggered){
            let query = `?deviceId=${user.Item.id}&run=activate&retry=false`
            let gather = response.gather({
                input: 'dtmf',
                timeout: 10,
                numDigits: 1,
                action: process.env.GATHER_URL + query
            });
            gather.say(
                {
                    language: 'es-MX'
                },
                "Bienvenido a segurirred. Presione uno para emergencia o dos para alerta"
            );
        } else {
            if(user.Item.tipo === "admin"){
                let query = `?deviceId=${user.Item.id}&run=deactivate&retry=false`
                let gather = response.gather({
                    input: 'dtmf',
                    timeout: 10,
                    numDigits: 1,
                    action: process.env.GATHER_URL + query
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