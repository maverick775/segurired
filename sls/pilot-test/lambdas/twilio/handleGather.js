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
                //HANDLE DIFFERENT RESPONSE CASE
            }
            let params = {
                "method": method,
                "params": {}
            };
            let thingsAnswer = await utils_1.sendRPCRequest(deviceId, params);
            console.log(thingsAnswer);
            console.log('Alarma activada');
            response.say({
                language: 'es-MX'
            }, "Alarma activada, gracias.");
            dynamoUpdateParams.shouldItemUpdate = true;
            dynamoUpdateParams.method = method;
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
    //UPDATE DYNAMODB NEEDED SHOULD BE HERE
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