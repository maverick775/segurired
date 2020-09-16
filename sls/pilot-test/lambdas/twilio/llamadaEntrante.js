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
    var _a;
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
            console.error(`El dispositivo ${user.Item.id} no se encontró en la base de datos`);
        }
        let neededParams = {
            sharedKeys: ['Triggered', 'Emergency'],
            clientKeys: ['Bateria']
        };
        try {
            var currParams = await utils_1.getThingsAtt(device.Item.token, neededParams);
            console.log('Current Device Parameters ');
            console.log(currParams);
        }
        catch (e) {
            console.error('Los parámetros no pudieron ser obtenidos de TB a continuación se muestra el error: ');
            console.error(e);
            var currParams = {
                shared: {
                    Triggered: (_a = device.Item) === null || _a === void 0 ? void 0 : _a.Triggered
                },
                client: {}
            };
        }
        if (!currParams.shared.Triggered) {
            let query = `?deviceId=${user.Item.id}&run=activate&retry=false`;
            let gather = response.gather({
                input: 'dtmf',
                timeout: 10,
                numDigits: 1,
                action: process.env.GATHER_URL + query
            });
            gather.say({
                language: 'es-MX'
            }, "Bienvenido a segurirred. Presione uno para emergencia o dos para alerta");
        }
        else {
            if (user.Item.tipo === "admin") {
                let query = `?deviceId=${user.Item.id}&run=deactivate&retry=false`;
                let gather = response.gather({
                    input: 'dtmf',
                    timeout: 10,
                    numDigits: 1,
                    action: process.env.GATHER_URL + query
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxhbWFkYUVudHJhbnRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGxhbWFkYUVudHJhbnRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLG1DQUErQjtBQUUvQiw4REFBNkI7QUFDN0IsbURBQTJEO0FBQzNELHVDQUEyQztBQUU5QixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxFQUFFOztJQUNwRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMzQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLHFCQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFLLENBQUMsQ0FBQztJQUM3QyxJQUFJLE1BQU0sQ0FBQztJQUNYLElBQUcsSUFBSSxFQUFDO1FBQ0osTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM1QjtJQUNELElBQUksSUFBSSxHQUFHLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFMUYsSUFBRyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUN4QixRQUFRLENBQUMsR0FBRyxDQUNSO1lBQ0ksUUFBUSxFQUFFLE9BQU87U0FDcEIsRUFDRCxrREFBa0QsQ0FDckQsQ0FBQztLQUNMO1NBQU07UUFDSCxJQUFJLE1BQU0sR0FBSSxNQUFNLGtCQUFPLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFDO1lBQ3pCLFFBQVEsQ0FBQyxHQUFHLENBQ1I7Z0JBQ0ks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