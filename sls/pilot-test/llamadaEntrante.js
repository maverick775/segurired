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
    const { Body, From } = querystring_1.default.parse(event.body);
    const response = new twilio_1.twiml.VoiceResponse();
    var user = await dynamodb_1.getItem({ TableName: 'registroAVP', Key: { numero: From } });
    //let item
    if (user) {
        var device = await dynamodb_1.getItem({ TableName: 'alarmas', Key: { id: user.Item.id } });
        if (!device.Item.activo) {
            response.say({
                language: 'es-MX'
            }, "Bienvenido a segurirred. Listo para activar");
        }
        else {
            response.say({
                language: 'es-MX'
            }, "Alarma activa. Confirme desactivacion.");
        }
    }
    else {
        response.say({
            language: 'es-MX'
        }, "Acceso restringido. Contacte a su representante.");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxhbWFkYUVudHJhbnRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGxhbWFkYUVudHJhbnRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLG1DQUErQjtBQUMvQixzQ0FBc0M7QUFFdEMsOERBQTZCO0FBQzdCLHlDQUFpRDtBQUVwQyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxFQUFFO0lBQ3BELE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcscUJBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQyxDQUFDO0lBQzdDLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzNDLElBQUksSUFBSSxHQUFHLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4RixVQUFVO0lBQ1YsSUFBRyxJQUFJLEVBQUM7UUFDSixJQUFJLE1BQU0sR0FBSSxNQUFNLGtCQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUM7WUFDbkIsUUFBUSxDQUFDLEdBQUcsQ0FDUjtnQkFDSSxRQUFRLEVBQUUsT0FBTzthQUNwQixFQUNELDZDQUE2QyxDQUNoRCxDQUFDO1NBQ0w7YUFBSTtZQUNELFFBQVEsQ0FBQyxHQUFHLENBQ1I7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87YUFDcEIsRUFDRCx3Q0FBd0MsQ0FDM0MsQ0FBQztTQUNMO0tBQ0o7U0FBTTtRQUNILFFBQVEsQ0FBQyxHQUFHLENBQ1I7WUFDSSxRQUFRLEVBQUUsT0FBTztTQUNwQixFQUNELGtEQUFrRCxDQUNyRCxDQUFDO0tBQ0w7SUFDRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUUvQixDQUFDLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO0lBQzdCLE9BQU87UUFDSCxVQUFVLEVBQUUsR0FBRztRQUNmLE9BQU8sRUFBRTtZQUNMLGNBQWMsRUFBRSxpQkFBaUI7U0FDcEM7UUFDRCxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUN6QixDQUFDO0FBQ04sQ0FBQyxDQUFDIn0=