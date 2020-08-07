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
            let query = `?deviceId=${user.Item.id}`;
            let gather = response.gather({
                input: 'dtmf',
                timeout: 10,
                numDigits: 1,
                action: 'https://jp0sa107zc.execute-api.us-west-1.amazonaws.com/auth-things/handleActivateGather' + query
            });
            gather.say({
                language: 'es-MX'
            }, "Bienvenido a segurirred. Presione uno para activar alarma");
        }
        else {
            if (user.Item.tipo === "admin") {
                let gather = response.gather({
                    input: 'dtmf',
                    timeout: 10,
                    numDigits: 1,
                    action: 'https://jp0sa107zc.execute-api.us-west-1.amazonaws.com/auth-things/handleDeactivateGather'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxhbWFkYUVudHJhbnRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGxhbWFkYUVudHJhbnRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLG1DQUErQjtBQUMvQixzQ0FBc0M7QUFFdEMsOERBQTZCO0FBQzdCLG1EQUEyRDtBQUU5QyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxFQUFFO0lBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUksY0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzNDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcscUJBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDO0lBQzdDLElBQUksTUFBTSxDQUFDO0lBQ1gsSUFBRyxJQUFJLEVBQUM7UUFDSixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzVCO0lBQ0QsSUFBSSxJQUFJLEdBQUcsTUFBTSxrQkFBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUxRixJQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3hCLFFBQVEsQ0FBQyxHQUFHLENBQ1I7WUFDSSxRQUFRLEVBQUUsT0FBTztTQUNwQixFQUNELGtEQUFrRCxDQUNyRCxDQUFDO0tBQ0w7U0FBTTtRQUNILElBQUksTUFBTSxHQUFJLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLElBQUcsTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUM7WUFDekIsUUFBUSxDQUFDLEdBQUcsQ0FDUjtnQkFDSSxRQUFRLEVBQUUsT0FBTzthQUNwQixFQUNELG1GQUFtRixDQUN0RixDQUFDO1NBQ0w7UUFDRCxJQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUM7WUFDbkIsSUFBSSxLQUFLLEdBQUcsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFBO1lBQ3ZDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ3pCLEtBQUssRUFBRSxNQUFNO2dCQUNiLE9BQU8sRUFBRSxFQUFFO2dCQUNYLFNBQVMsRUFBRSxDQUFDO2dCQUNaLE1BQU0sRUFBRSx5RkFBeUYsR0FBQyxLQUFLO2FBQzFHLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxHQUFHLENBQ047Z0JBQ0ksUUFBUSxFQUFFLE9BQU87YUFDcEIsRUFDRCwyREFBMkQsQ0FDOUQsQ0FBQztTQUNMO2FBQU07WUFDSCxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztnQkFDMUIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDekIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsU0FBUyxFQUFFLENBQUM7b0JBQ1osTUFBTSxFQUFFLDJGQUEyRjtpQkFDdEcsQ0FBQyxDQUFDO2dCQUNILE1BQU0sQ0FBQyxHQUFHLENBQ047b0JBQ0ksUUFBUSxFQUFFLE9BQU87aUJBQ3BCLEVBQ0QsZ0RBQWdELENBQ25ELENBQUM7YUFDTDtpQkFBTTtnQkFDSCxRQUFRLENBQUMsR0FBRyxDQUNSO29CQUNJLFFBQVEsRUFBRSxPQUFPO2lCQUNwQixFQUNELDZEQUE2RCxDQUNoRSxDQUFDO2FBQ0w7U0FDSjtLQUNKO0lBQ0QsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFL0IsQ0FBQyxDQUFDO0FBRUYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRTtJQUM3QixPQUFPO1FBQ0gsVUFBVSxFQUFFLEdBQUc7UUFDZixPQUFPLEVBQUU7WUFDTCxjQUFjLEVBQUUsaUJBQWlCO1NBQ3BDO1FBQ0QsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUU7S0FDekIsQ0FBQztBQUNOLENBQUMsQ0FBQyJ9