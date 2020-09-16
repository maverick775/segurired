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
            let method = '';
            if (parsedBody.Digits === '1') {
                method = "actEm";
            }
            else if (parsedBody.Digits === '2') {
                method = "actAl";
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
                response.record({
                    timeout: 5,
                    action: process.env.FINISH_CALL_URL,
                    recordingStatusCallback: process.env.SEND_TG_MSG_URL
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
            let method = "";
            if (parsedBody.Digits === '1') {
                method = "desAl";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlR2F0aGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGFuZGxlR2F0aGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1DQUErQjtBQUUvQixtREFBa0Q7QUFDbEQseUNBQThDO0FBR2pDLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLEVBQUU7SUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN4QixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUM7SUFDOUMsSUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV6QixJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3BDLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLGtCQUFrQixDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUM1QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssVUFBVSxFQUFFO1FBQ2hDLElBQUk7WUFDQSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsSUFBRyxVQUFVLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBQztnQkFDekIsTUFBTSxHQUFHLE9BQU8sQ0FBQzthQUNwQjtpQkFBSyxJQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFDO2dCQUMvQixNQUFNLEdBQUcsT0FBTyxDQUFDO2FBQ3BCO2lC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