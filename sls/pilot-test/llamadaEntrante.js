"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const twilio_1 = require("twilio");
//import { sendTwiml } from "./utils";
const querystring_1 = __importDefault(require("querystring"));
const dynamodb_1 = require("./dynamodb");
exports.handler = async (event) => {
    const response = new twilio_1.twiml.VoiceResponse();
    const { Body, From } = querystring_1.default.parse(event.body);
    let user = await dynamodb_1.getItem({ TableName: 'registroAVP', Key: { numero: From } });
    if (typeof user.Item === 'undefined') {
        response.say({
            language: 'es-MX'
        }, "Acceso restringido. Contacte a su representante.");
    }
    else {
        let device = await dynamodb_1.getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        if (!device.Item.activo) {
            response.say({
                language: 'es-MX'
            }, "Bienvenido a segurirred. Listo para activar");
        }
        else {
            if (user.Item.tipo === "admin") {
                response.say({
                    language: 'es-MX'
                }, "Alarma activa. Confirme desactivacion.");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxhbWFkYUVudHJhbnRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGxhbWFkYUVudHJhbnRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLG1DQUErQjtBQUMvQixzQ0FBc0M7QUFFdEMsOERBQTZCO0FBQzdCLHlDQUFpRDtBQUVwQyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxFQUFFO0lBQ3BELE1BQU0sUUFBUSxHQUFHLElBQUksY0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzNDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcscUJBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDO0lBQzdDLElBQUksSUFBSSxHQUFHLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4RixJQUFHLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7UUFDakMsUUFBUSxDQUFDLEdBQUcsQ0FDUjtZQUNJLFFBQVEsRUFBRSxPQUFPO1NBQ3BCLEVBQ0Qsa0RBQWtELENBQ3JELENBQUM7S0FDTDtTQUFNO1FBQ0gsSUFBSSxNQUFNLEdBQUksTUFBTSxrQkFBTyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakYsSUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDO1lBQ25CLFFBQVEsQ0FBQyxHQUFHLENBQ1I7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87YUFDcEIsRUFDRCw2Q0FBNkMsQ0FDaEQsQ0FBQztTQUNMO2FBQU07WUFDSCxJQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztnQkFDMUIsUUFBUSxDQUFDLEdBQUcsQ0FDUjtvQkFDSSxRQUFRLEVBQUUsT0FBTztpQkFDcEIsRUFDRCx3Q0FBd0MsQ0FDM0MsQ0FBQzthQUNMO2lCQUFNO2dCQUNILFFBQVEsQ0FBQyxHQUFHLENBQ1I7b0JBQ0ksUUFBUSxFQUFFLE9BQU87aUJBQ3BCLEVBQ0QsNkRBQTZELENBQ2hFLENBQUM7YUFDTDtTQUNKO0tBQ0o7SUFDRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUUvQixDQUFDLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO0lBQzdCLE9BQU87UUFDSCxVQUFVLEVBQUUsR0FBRztRQUNmLE9BQU8sRUFBRTtZQUNMLGNBQWMsRUFBRSxpQkFBaUI7U0FDcEM7UUFDRCxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUN6QixDQUFDO0FBQ04sQ0FBQyxDQUFDIn0=