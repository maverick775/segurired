"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const twilio_1 = require("twilio");
const dynamodb_1 = require("../../utils/dynamodb");
const sqs_1 = require("../../utils/sqs");
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
            let method = 'set_state';
            let params = { trigger: false, emg: false };
            if (parsedBody.Digits === '1') {
                params.trigger = true;
                params.emg = true;
            }
            else if (parsedBody.Digits === '2') {
                params.trigger = true;
                params.emg = false;
            }
            else {
                console.log(queryParams.retry);
                if (queryParams.retry === 'false') {
                    let query = `?deviceId=${deviceId}&run=${queryParams.run}&retry=true&params=${JSON.stringify(params)}`;
                    let gather = response.gather({
                        input: 'dtmf',
                        timeout: 10,
                        numDigits: 1,
                        action: process.env.GATHER_URL + query
                    });
                    gather.say({
                        language: 'es-MX'
                    }, "Se introdujo un número incorrecto por favor presione uno para emergencia dos para alerta");
                }
                else {
                    response.say({
                        language: 'es-MX'
                    }, "Se introdujo un número incorrecto nuevamente por lo tanto se cancela la peticion, hasta luego.");
                    response.hangup();
                }
                return sendTwiml(response);
            }
            //A SQS MSG SHOULD BE SENT HERE
            let SQSparams = {
                DelaySeconds: 0,
                MessageAttributes: {
                    "method": {
                        DataType: "String",
                        StringValue: method
                    },
                    "deviceID": {
                        DataType: "String",
                        StringValue: deviceId
                    },
                    "trigger": {
                        DataType: "String",
                        StringValue: params.trigger.toString()
                    },
                    "emg": {
                        DataType: "String",
                        StringValue: params.trigger.toString()
                    }
                },
                MessageBody: "rpcRequest",
                QueueUrl: process.env.SQS_URL
            };
            let answerSQS = await sqs_1.sendMessage(SQSparams);
            console.log(answerSQS);
            if (answerSQS) {
                console.log('Alarma activada');
                response.say({
                    language: 'es-MX'
                }, "Tu peticion fue recibida. Para agregar mensaje de voz grabe después del tono");
                let from = decodeURIComponent(parsedBody === null || parsedBody === void 0 ? void 0 : parsedBody.From);
                let query = `?from=${from}`;
                response.record({
                    timeout: 5,
                    action: process.env.FINISH_CALL_URL,
                    recordingStatusCallback: process.env.SEND_TG_MSG_URL + query
                });
                // dynamoUpdateParams.shouldItemUpdate = true;
                // dynamoUpdateParams.method = method;
            }
            else {
                console.error('SQS msg could not be sent, cehck logs for more details');
                //HANDLE CASE WHERE THE RPC REQUEST WAS NOT SUCCESFUL 
                //MAYBE A SECOND TRY SHOULD BE ATTEMPETED OR AT LEAST SEND A MESSAGE TO EVERYONE
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
            let method = 'set_state';
            let params = { trigger: false, emg: false };
            if (parsedBody.Digits === '1') {
                method = "set_state";
            }
            else {
                console.log(queryParams.retry);
                if (queryParams.retry === 'false') {
                    let query = `?deviceId=${deviceId}&run=${queryParams.run}&retry=true`;
                    let gather = response.gather({
                        input: 'dtmf',
                        timeout: 10,
                        numDigits: 1,
                        action: process.env.GATHER_URL + query
                    });
                    gather.say({
                        language: 'es-MX'
                    }, "Se introdujo un número incorrecto por favor presione uno para desactivar alarma");
                }
                else {
                    response.say({
                        language: 'es-MX'
                    }, "Se introdujo un número incorrecto nuevamente por lo tanto se cancela la peticion, hasta luego.");
                    response.hangup();
                }
                return sendTwiml(response);
            }
            //A SQS MSG SHOULD BE SENT HERE
            let SQSparams = {
                DelaySeconds: 0,
                MessageAttributes: {
                    "method": {
                        DataType: "String",
                        StringValue: method
                    },
                    "deviceID": {
                        DataType: "String",
                        StringValue: deviceId
                    },
                    "trigger": {
                        DataType: "String",
                        StringValue: params.trigger.toString()
                    },
                    "emg": {
                        DataType: "String",
                        StringValue: params.trigger.toString()
                    }
                },
                MessageBody: "rpcRequest",
                QueueUrl: process.env.SQS_URL
            };
            let answerSQS = await sqs_1.sendMessage(SQSparams);
            console.log(answerSQS);
            response.say({
                language: 'es-MX'
            }, "Alarma desactivada, gracias.");
            //dynamoUpdateParams.shouldItemUpdate = true;
        }
        catch (e) {
            console.error('Error al desactivar alarma revisar registros de dispositivo ' + deviceId);
            console.error(e);
            response.say({
                language: 'es-MX'
            }, "La alarma no pudo ser desactivada, por favor vuelve a intentar o contacte a Segurired.");
        }
    }
    // //UPDATE DYNAMODB 
    // if (dynamoUpdateParams.shouldItemUpdate) {
    //     try{
    //         let answer = await updateAlarmStatus(deviceId, queryParams.run, dynamoUpdateParams.method);
    //         console.log({
    //             title: 'DB updated',
    //             message: answer
    //         });
    //     }catch(e){
    //         console.error('Dynamo no pudo ser actualizado');
    //         console.error(e);
    //     }
    // }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlR2F0aGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGFuZGxlR2F0aGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1DQUErQjtBQUUvQixtREFBa0Q7QUFDbEQseUNBQThDO0FBR2pDLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLEVBQUU7SUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN4QixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUM7SUFDOUMsSUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV6QixJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3BDLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLGtCQUFrQixDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUM1QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssVUFBVSxFQUFFO1FBQ2hDLElBQUk7WUFDQSxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUM7WUFDekIsSUFBSSxNQUFNLEdBQUcsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQztZQUMxQyxJQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFDO2dCQUN6QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztn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