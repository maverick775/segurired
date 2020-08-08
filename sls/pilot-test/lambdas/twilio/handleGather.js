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