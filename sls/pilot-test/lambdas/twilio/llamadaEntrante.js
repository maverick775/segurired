"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const twilio_1 = require("twilio");
const querystring_1 = __importDefault(require("querystring"));
const dynamodb_1 = require("../../utils/dynamodb");
const utils_1 = require("../../utils");
exports.handler = async (event) => {
    const response = new twilio_1.twiml.VoiceResponse();
    const { Body, From } = querystring_1.default.parse(event.body);
    let caller;
    if (From) {
        caller = From.slice(-10);
    }
    let user = await dynamodb_1.getItem({ TableName: 'registroAVP', Key: { numero: caller } });
    if (user.Item === undefined) {
        response.say({
            language: 'es-MX'
        }, "Acceso restringido. Contacte a su representante.");
    }
    else {
        let device = await dynamodb_1.getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        //SUSTITUIR BUSQUEDA DE PARAMS EN DYNAMO POR BUSQUEDA EN TB
        if (device.Item === undefined) {
            response.say({
                language: 'es-MX'
            }, "No se encontró un dispositivo asociado a este número. Contacte a su administrador");
            console.error(`El dispositivo ${user.Item.id} no se encontró en la base de datos`);
        }
        let neededParams = {
            clientKeys: ['Activo', 'Alerta', 'Emergencia']
        };
        let currParams = await utils_1.getThingsAtt(device.Item.token);
        console.log('Parametros');
        console.log(currParams);
        if (currParams.activo) {
            let query = `?deviceId=${user.Item.id}&alerta=${device.Item.alerta}&run=activate`;
            let gather = response.gather({
                input: 'dtmf',
                timeout: 10,
                numDigits: 1,
                action: 'https://jp0sa107zc.execute-api.us-west-1.amazonaws.com/auth-things/handleGather' + query
            });
            gather.say({
                language: 'es-MX'
            }, "Bienvenido a segurirred. Presione uno para emergencia o dos para alerta");
        }
        else {
            if (user.Item.tipo === "admin") {
                let query = `?deviceId=${user.Item.id}&alerta=${device.Item.alerta}&run=deactivate`;
                let gather = response.gather({
                    input: 'dtmf',
                    timeout: 10,
                    numDigits: 1,
                    action: 'https://jp0sa107zc.execute-api.us-west-1.amazonaws.com/auth-things/handleGather' + query
                });
                gather.say({
                    language: 'es-MX'
                }, "Alarma está activa, para desactivar presione 1");
            }
            else {
                response.say({
                    language: 'es-MX'
                }, "Alarma activa. Contacte a su representante para desactivar.");
            }
        }
    }
    return sendTwiml(response);
};
const sendTwiml = (twiml) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml"
        },
        body: twiml.toString()
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxhbWFkYUVudHJhbnRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGxhbWFkYUVudHJhbnRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLG1DQUErQjtBQUUvQiw4REFBNkI7QUFDN0IsbURBQTJEO0FBQzNELHVDQUEyQztBQUU5QixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxFQUFFO0lBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUksY0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzNDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcscUJBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDO0lBQzdDLElBQUksTUFBTSxDQUFDO0lBQ1gsSUFBRyxJQUFJLEVBQUM7UUFDSixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzVCO0lBQ0QsSUFBSSxJQUFJLEdBQUcsTUFBTSxrQkFBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUxRixJQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3hCLFFBQVEsQ0FBQyxHQUFHLENBQ1I7WUFDSSxRQUFRLEVBQUUsT0FBTztTQUNwQixFQUNELGtEQUFrRCxDQUNyRCxDQUFDO0tBQ0w7U0FBTTtRQUNILElBQUksTUFBTSxHQUFJLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLDJEQUEyRDtRQUMzRCxJQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFDO1lBQ3pCLFFBQVEsQ0FBQyxHQUFHLENBQ1I7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87YUFDcEIsRUFDRCxtRkFBbUYsQ0FDdEYsQ0FBQztZQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsSUFBSSxZQUFZLEdBQUc7WUFDZixVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLFlBQVksQ0FBQztTQUMvQyxDQUFBO1FBQ0QsSUFBSSxVQUFVLEdBQUcsTUFBTSxvQkFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hCLElBQUcsVUFBVSxDQUFDLE1BQU0sRUFBQztZQUNqQixJQUFJLEtBQUssR0FBRyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxlQUFlLENBQUE7WUFDakYsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxFQUFFLGlGQUFpRixHQUFDLEtBQUs7YUFDbEcsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FDTjtnQkFDSSxRQUFRLEVBQUUsT0FBTzthQUNwQixFQUNELHlFQUF5RSxDQUM1RSxDQUFDO1NBQ0w7YUFBTTtZQUNILElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFDO2dCQUMxQixJQUFJLEtBQUssR0FBRyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBaUIsQ0FBQTtnQkFDbkYsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDekIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsU0FBUyxFQUFFLENBQUM7b0JBQ1osTUFBTSxFQUFFLGlGQUFpRixHQUFDLEtBQUs7aUJBQ2xHLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsR0FBRyxDQUNOO29CQUNJLFFBQVEsRUFBRSxPQUFPO2lCQUNwQixFQUNELGdEQUFnRCxDQUNuRCxDQUFDO2FBQ0w7aUJBQU07Z0JBQ0gsUUFBUSxDQUFDLEdBQUcsQ0FDUjtvQkFDSSxRQUFRLEVBQUUsT0FBTztpQkFDcEIsRUFDRCw2REFBNkQsQ0FDaEUsQ0FBQzthQUNMO1NBQ0o7S0FDSjtJQUNELE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRS9CLENBQUMsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7SUFDN0IsT0FBTztRQUNILFVBQVUsRUFBRSxHQUFHO1FBQ2YsT0FBTyxFQUFFO1lBQ0wsY0FBYyxFQUFFLGlCQUFpQjtTQUNwQztRQUNELElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFO0tBQ3pCLENBQUM7QUFDTixDQUFDLENBQUMifQ==