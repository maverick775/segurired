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
                let query = `?deviceId=${deviceId}`;
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
            let method = '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlR2F0aGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGFuZGxlR2F0aGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1DQUErQjtBQUUvQixtREFBa0Q7QUFDbEQseUNBQThDO0FBR2pDLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFBRSxLQUFzQixFQUFFLEVBQUU7SUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN4QixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUM7SUFDOUMsSUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUV6QixJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBQ3BDLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLGtCQUFrQixDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUM1QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssVUFBVSxFQUFFO1FBQ2hDLElBQUk7WUFDQSxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUM7WUFDekIsSUFBSSxNQUFNLEdBQUcsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQztZQUMxQyxJQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFDO2dCQUN6QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDdEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7YUFDckI7aUJBQUssSUFBRyxVQUFVLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBQztnQkFDL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO2FBQ3RCO2lCQUFJO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixJQUFHLFdBQVcsQ0FBQyxLQUFLLEtBQUssT0FBTyxFQUFDO29CQUM3QixJQUFJLEtBQUssR0FBRyxhQUFhLFFBQVEsUUFBUSxXQUFXLENBQUMsR0FBRyxzQkFBc0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFBO29CQUN0RyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO3dCQUN6QixLQUFLLEVBQUUsTUFBTTt3QkFDYixPQUFPLEVBQUUsRUFBRTt3QkFDWCxTQUFTLEVBQUUsQ0FBQzt3QkFDWixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSztxQkFDekMsQ0FBQyxDQUFDO29CQUNILE1BQU0sQ0FBQyxHQUFHLENBQ047d0JBQ0ksUUFBUSxFQUFFLE9BQU87cUJBQ3BCLEVBQ0QsMEZBQTBGLENBQzdGLENBQUM7aUJBQ0w7cUJBQUk7b0JBQ0QsUUFBUSxDQUFDLEdBQUcsQ0FDUjt3QkFDSSxRQUFRLEVBQUUsT0FBTztxQkFDcEIsRUFDRCxnR0FBZ0csQ0FDbkcsQ0FBQztvQkFDRixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ3JCO2dCQUNELE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQzdCO1lBQ0QsK0JBQStCO1lBQy9CLElBQUksU0FBUyxHQUFHO2dCQUNaLFlBQVksRUFBRSxDQUFDO2dCQUNmLGlCQUFpQixFQUFFO29CQUNmLFFBQVEsRUFBQzt3QkFDTCxRQUFRLEVBQUcsUUFBUTt3QkFDbkIsV0FBVyxFQUFFLE1BQU07cUJBQ3RCO29CQUNELFVBQVUsRUFBQzt3QkFDUCxRQUFRLEVBQUcsUUFBUTt3QkFDbkIsV0FBVyxFQUFFLFFBQVE7cUJBQ3hCO29CQUNELFNBQVMsRUFBQzt3QkFDTixRQUFRLEVBQUcsUUFBUTt3QkFDbkIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO3FCQUN6QztvQkFDRCxLQUFLLEVBQUM7d0JBQ0YsUUFBUSxFQUFHLFFBQVE7d0JBQ25CLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtxQkFDekM7aUJBQ0o7Z0JBQ0QsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU87YUFDaEMsQ0FBQTtZQUNELElBQUksU0FBUyxHQUFHLE1BQU0saUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUcsU0FBUyxFQUFDO2dCQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDL0IsUUFBUSxDQUFDLEdBQUcsQ0FDUjtvQkFDSSxRQUFRLEVBQUUsT0FBTztpQkFDcEIsRUFDRCw4RUFBOEUsQ0FDakYsQ0FBQztnQkFDRixJQUFJLEtBQUssR0FBRyxhQUFhLFFBQVEsRUFBRSxDQUFBO2dCQUNuQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUNaLE9BQU8sRUFBRSxDQUFDO29CQUNWLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWU7b0JBQ25DLHVCQUF1QixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFDLEtBQUs7aUJBQzdELENBQUMsQ0FBQztnQkFFSCw4Q0FBOEM7Z0JBQzlDLHNDQUFzQzthQUN6QztpQkFBSTtnQkFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxDQUFDLENBQUM7Z0JBQ3hFLHNEQUFzRDtnQkFDdEQsZ0ZBQWdGO2dCQUNoRix5R0FBeUc7YUFDNUc7U0FFSjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQywyREFBMkQsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUN0RixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLFFBQVEsQ0FBQyxHQUFHLENBQ1I7Z0JBQ0ksUUFBUSxFQUFFLE9BQU87YUFDcEIsRUFDRCxxRkFBcUYsQ0FDeEYsQ0FBQztTQUNMO0tBQ0o7U0FBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssWUFBWSxFQUFFO1FBQ3pDLElBQUk7WUFDQSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsSUFBSSxNQUFNLEdBQUcsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQztZQUMxQyxJQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFDO2dCQUN6QixNQUFNLEdBQUcsV0FBVyxDQUFBO2FBQ3ZCO2lCQUFJO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixJQUFHLFdBQVcsQ0FBQyxLQUFLLEtBQUssT0FBTyxFQUFDO29CQUM3QixJQUFJLEtBQUssR0FBRyxhQUFhLFFBQVEsUUFBUSxXQUFXLENBQUMsR0FBRyxhQUFhLENBQUE7b0JBQ3JFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7d0JBQ3pCLEtBQUssRUFBRSxNQUFNO3dCQUNiLE9BQU8sRUFBRSxFQUFFO3dCQUNYLFNBQVMsRUFBRSxDQUFDO3dCQUNaLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxLQUFLO3FCQUN6QyxDQUFDLENBQUM7b0JBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FDTjt3QkFDSSxRQUFRLEVBQUUsT0FBTztxQkFDcEIsRUFDRCxpRkFBaUYsQ0FDcEYsQ0FBQztpQkFDTDtxQkFBSTtvQkFDRCxRQUFRLENBQUMsR0FBRyxDQUNSO3dCQUNJLFFBQVEsRUFBRSxPQUFPO3FCQUNwQixFQUNELGdHQUFnRyxDQUNuRyxDQUFDO29CQUNGLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDckI7Z0JBQ0QsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDN0I7WUFDQSwrQkFBK0I7WUFDL0IsSUFBSSxTQUFTLEdBQUc7Z0JBQ2IsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsaUJBQWlCLEVBQUU7b0JBQ2YsUUFBUSxFQUFDO3dCQUNMLFFBQVEsRUFBRyxRQUFRO3dCQUNuQixXQUFXLEVBQUUsTUFBTTtxQkFDdEI7b0JBQ0QsVUFBVSxFQUFDO3dCQUNQLFFBQVEsRUFBRyxRQUFRO3dCQUNuQixXQUFXLEVBQUUsUUFBUTtxQkFDeEI7b0JBQ0QsU0FBUyxFQUFDO3dCQUNOLFFBQVEsRUFBRyxRQUFRO3dCQUNuQixXQUFXLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7cUJBQ3pDO29CQUNELEtBQUssRUFBQzt3QkFDRixRQUFRLEVBQUcsUUFBUTt3QkFDbkIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO3FCQUN6QztpQkFDSjtnQkFDRCxXQUFXLEVBQUUsWUFBWTtnQkFDekIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTzthQUNoQyxDQUFBO1lBQ0QsSUFBSSxTQUFTLEdBQUcsTUFBTSxpQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsUUFBUSxDQUFDLEdBQUcsQ0FDUjtnQkFDSSxRQUFRLEVBQUUsT0FBTzthQUNwQixFQUNELDhCQUE4QixDQUNqQyxDQUFDO1lBQ0YsNkNBQTZDO1NBQ2hEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLDhEQUE4RCxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsUUFBUSxDQUFDLEdBQUcsQ0FDUjtnQkFDSSxRQUFRLEVBQUUsT0FBTzthQUNwQixFQUNELHdGQUF3RixDQUMzRixDQUFDO1NBQ0w7S0FDSjtJQUNELHFCQUFxQjtJQUNyQiw2Q0FBNkM7SUFDN0MsV0FBVztJQUNYLHNHQUFzRztJQUN0Ryx3QkFBd0I7SUFDeEIsbUNBQW1DO0lBQ25DLDhCQUE4QjtJQUM5QixjQUFjO0lBQ2QsaUJBQWlCO0lBQ2pCLDJEQUEyRDtJQUMzRCw0QkFBNEI7SUFDNUIsUUFBUTtJQUNSLElBQUk7SUFDSixPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO0lBQzdCLE9BQU87UUFDSCxVQUFVLEVBQUUsR0FBRztRQUNmLE9BQU8sRUFBRTtZQUNMLGNBQWMsRUFBRSxpQkFBaUI7U0FDcEM7UUFDRCxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUN6QixDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRTtJQUNyQyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNwQixhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDM0IsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDakYsSUFBSSxjQUFjLEdBQUcsTUFBTSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDMUQsSUFBSSxhQUFhLEdBQUcsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDdEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxxQkFBVSxDQUN6QjtRQUNJLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLEdBQUcsRUFBRTtZQUNELEVBQUUsRUFBRSxRQUFRO1NBQ2Y7UUFDRCx5QkFBeUIsRUFBRTtZQUN2QixTQUFTLEVBQUUsY0FBYztZQUN6QixRQUFRLEVBQUUsYUFBYTtTQUMxQjtRQUNELGdCQUFnQixFQUFFLHVDQUF1QztRQUN6RCxZQUFZLEVBQUUsU0FBUztLQUMxQixDQUNKLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUEifQ==