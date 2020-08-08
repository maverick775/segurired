"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const twilio_1 = require("twilio");
//import { sendTwiml } from "./utils";
const querystring_1 = __importDefault(require("querystring"));
const dynamodb_1 = require("../../utils/dynamodb");
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
        if (device.Item === undefined) {
            response.say({
                language: 'es-MX'
            }, "No se encontró un dispositivo asociado a este número. Contacte a su administrador");
        }
        if (!device.Item.activo) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxhbWFkYUVudHJhbnRlLi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxsYW1hZGFFbnRyYW50ZS4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsbUNBQStCO0FBQy9CLHNDQUFzQztBQUV0Qyw4REFBNkI7QUFDN0IsbURBQTJEO0FBRTlDLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLEVBQUU7SUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDM0MsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxxQkFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFDLENBQUM7SUFDN0MsSUFBSSxNQUFNLENBQUM7SUFDWCxJQUFHLElBQUksRUFBQztRQUNKLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDNUI7SUFDRCxJQUFJLElBQUksR0FBRyxNQUFNLGtCQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTFGLElBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7UUFDeEIsUUFBUSxDQUFDLEdBQUcsQ0FDUjtZQUNJLFFBQVEsRUFBRSxPQUFPO1NBQ3BCLEVBQ0Qsa0RBQWtELENBQ3JELENBQUM7S0FDTDtTQUFNO1FBQ0gsSUFBSSxNQUFNLEdBQUksTUFBTSxrQkFBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakYsSUFBRyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBQztZQUN6QixRQUFRLENBQUMsR0FBRyxDQUNSO2dCQUNJLFFBQVEsRUFBRSxPQUFPO2FBQ3BCLEVBQ0QsbUZBQW1GLENBQ3RGLENBQUM7U0FDTDtRQUNELElBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQztZQUNuQixJQUFJLEtBQUssR0FBRyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxlQUFlLENBQUE7WUFDakYsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLENBQUM7Z0JBQ1osTUFBTSxFQUFFLGlGQUFpRixHQUFDLEtBQUs7YUFDbEcsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FDTjtnQkFDSSxRQUFRLEVBQUUsT0FBTzthQUNwQixFQUNELHlFQUF5RSxDQUM1RSxDQUFDO1NBQ0w7YUFBTTtZQUNILElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFDO2dCQUMxQixJQUFJLEtBQUssR0FBRyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBaUIsQ0FBQTtnQkFDbkYsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDekIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsU0FBUyxFQUFFLENBQUM7b0JBQ1osTUFBTSxFQUFFLGlGQUFpRixHQUFDLEtBQUs7aUJBQ2xHLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsR0FBRyxDQUNOO29CQUNJLFFBQVEsRUFBRSxPQUFPO2lCQUNwQixFQUNELGdEQUFnRCxDQUNuRCxDQUFDO2FBQ0w7aUJBQU07Z0JBQ0gsUUFBUSxDQUFDLEdBQUcsQ0FDUjtvQkFDSSxRQUFRLEVBQUUsT0FBTztpQkFDcEIsRUFDRCw2REFBNkQsQ0FDaEUsQ0FBQzthQUNMO1NBQ0o7S0FDSjtJQUNELE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRS9CLENBQUMsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7SUFDN0IsT0FBTztRQUNILFVBQVUsRUFBRSxHQUFHO1FBQ2YsT0FBTyxFQUFFO1lBQ0wsY0FBYyxFQUFFLGlCQUFpQjtTQUNwQztRQUNELElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFO0tBQ3pCLENBQUM7QUFDTixDQUFDLENBQUMifQ==