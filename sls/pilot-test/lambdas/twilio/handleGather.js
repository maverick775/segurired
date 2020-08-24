"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const twilio_1 = require("twilio");
const utils_1 = require("../../utils");
const dynamodb_1 = require("../../utils/dynamodb");
// 4. Pause call
// 4.1 if call still going, tell visitor to try again
exports.handler = async (event) => {
    const response = new twilio_1.twiml.VoiceResponse();
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const body = event.body;
    let queryParams = event.queryStringParameters;
    let parsedBody = parseGatherBody(body);
    console.log(parsedBody);
    console.log(queryParams);
    var deviceId = queryParams.deviceId;
    let dynamoUpdateParams = {};
    dynamoUpdateParams.shouldItemUpdate = false;
    if (queryParams.run === 'activate') {
        try {
            let method = '';
            if (parsedBody.Digits === '1') {
                method = "actEm";
            }
            else if (parsedBody.Digits === '2') {
                method = "actAl";
            }
            else {
                //HANDLE DIFFERENT RESPONSE CASE RETRY MAXIMUM 2 RETRIES
            }
            let params = {
                "method": method,
                "params": {}
            };
            let thingsAnswer = await utils_1.sendRPCRequest(deviceId, params);
            console.log(thingsAnswer);
            if (thingsAnswer.status >= 200 && thingsAnswer.status < 300) {
                console.log('Alarma activada');
                response.say({
                    language: 'es-MX'
                }, "Alarma activada, gracias. Para agregar mensaje de voz grabe después del tono");
                response.record({
                    timeout: 5,
                    action: process.env.FINISH_CALL_URL,
                    recordingStatusCallback: process.env.SEND_TG_MSG_URL
                });
                dynamoUpdateParams.shouldItemUpdate = true;
                dynamoUpdateParams.method = method;
            }
            else {
                //HANDLE CASE WHERE THE RPC REQUEST WAS NOT SUCCESFUL 
                //NOTE: SINCE LAST FIRMWARE MAJOR CHANGES, THE RESPONSE'S BODY HAS BEEN A PROMISE, IT SHOULD BE CORRECTED
            }
        }
        catch (e) {
            console.error('Error al activar alarma revisar registros de dispositivo ' + deviceId);
            console.error(e);
            response.say({
                language: 'es-MX'
            }, "La alarma no pudo ser activada, por favor vuelve a intentar o contacte a Segurired.");
        }
    }
    else if (queryParams.run === 'deactivate') {
        try {
            let params = {
                "method": "desAl",
                "params": {}
            };
            let thingsAnswer = await utils_1.sendRPCRequest(deviceId, params);
            console.log(thingsAnswer);
            console.log('Alarma desactivada');
            response.say({
                language: 'es-MX'
            }, "Alarma desactivada, gracias.");
            dynamoUpdateParams.shouldItemUpdate = true;
        }
        catch (e) {
            console.error('Error al activar alarma revisar registros de dispositivo ' + deviceId);
            console.error(e);
            response.say({
                language: 'es-MX'
            }, "La alarma no pudo ser desactivada, por favor vuelve a intentar o contacte a Segurired.");
        }
    }
    //UPDATE DYNAMODB 
    if (dynamoUpdateParams.shouldItemUpdate) {
        try {
            let answer = await updateAlarmStatus(deviceId, queryParams.run, dynamoUpdateParams.method);
            console.log({
                title: 'DB updated',
                message: answer
            });
        }
        catch (e) {
            console.error('Dynamo no pudo ser actualizado');
            console.error(e);
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
const parseGatherBody = (body) => {
    let pairsKeyValue = body.split('&');
    let parsedBody = {};
    pairsKeyValue.forEach((pair) => {
        let separated = pair.split('=');
        parsedBody[separated[0]] = separated[1];
    });
    return parsedBody;
};
const updateAlarmStatus = async (deviceId, action, method) => {
    let newActiveValue = action === 'activate' ? true : false;
    let newAlertValue = method === 'actEm' ? true : false;
    let answer = await dynamodb_1.updateItem({
        TableName: 'alarmas',
        Key: {
            id: deviceId
        },
        ExpressionAttributeValues: {
            ':active': newActiveValue,
            ':alert': newAlertValue
        },
        UpdateExpression: 'set activo = :active, alerta = :alert',
        ReturnValues: 'ALL_NEW',
    });
    return answer;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlR2F0aGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGFuZGxlR2F0aGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1DQUErQjtBQUMvQix1Q0FBNkM7QUFDN0MsbURBQWtEO0FBRWxELGdCQUFnQjtBQUNoQixxREFBcUQ7QUFFeEMsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQXNCLEVBQUUsRUFBRTtJQUNwRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3hCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXpCLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDcEMsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsa0JBQWtCLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0lBQzVDLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxVQUFVLEVBQUU7UUFDaEMsSUFBSTtZQUNBLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFDO2dCQUN6QixNQUFNLEdBQUcsT0FBTyxDQUFDO2FBQ3BCO2lCQUFLLElBQUcsVUFBVSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUM7Z0JBQy9CLE1B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