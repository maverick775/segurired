
import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
import { sendRPCRequest } from "../../utils";
import { updateItem } from "../../utils/dynamodb";
import { sendMessage } from "../../utils/sqs";
import qs from "querystring";

export const handler = async (event: APIGatewayEvent) => {
    const response = new twiml.VoiceResponse();
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
            let params = {trigger: false, emg: false};
            if(parsedBody.Digits === '1'){
                params.trigger = true;
                params.emg = true;
            }else if(parsedBody.Digits === '2'){
                params.trigger = true;
                params.emg = false;
            }else{
                console.log(queryParams.retry);
                if(queryParams.retry === 'false'){
                    let query = `?deviceId=${deviceId}&run=${queryParams.run}&retry=true&params=${JSON.stringify(params)}`
                    let gather = response.gather({
                        input: 'dtmf',
                        timeout: 10,
                        numDigits: 1,
                        action: process.env.GATHER_URL + query
                    });
                    gather.say(
                        {
                            language: 'es-MX'
                        },
                        "Se introdujo un número incorrecto por favor presione uno para emergencia dos para alerta"
                    );
                }else{
                    response.say(
                        {
                            language: 'es-MX'
                        },
                        "Se introdujo un número incorrecto nuevamente por lo tanto se cancela la peticion, hasta luego."
                    );
                    response.hangup(); 
                }
                return sendTwiml(response)
            }
            //A SQS MSG SHOULD BE SENT HERE
            let SQSparams = {
                DelaySeconds: 0,
                MessageAttributes: {
                    "method":{
                        DataType:  "String",
                        StringValue: method
                    },
                    "deviceID":{
                        DataType:  "String",
                        StringValue: deviceId
                    },
                    "trigger":{
                        DataType:  "String",
                        StringValue: params.trigger.toString()
                    },
                    "emg":{
                        DataType:  "String",
                        StringValue: params.trigger.toString()
                    }
                },
                MessageBody: "rpcRequest",
                QueueUrl: process.env.SQS_URL
            }
            let answerSQS = await sendMessage(SQSparams);
            console.log(answerSQS);
            if(answerSQS){
                console.log('Alarma activada');
                response.say(
                    {
                        language: 'es-MX'
                    },
                    "Tu peticion fue recibida. Para agregar mensaje de voz grabe después del tono"
                );
                let from = decodeURIComponent(parsedBody?.From);
                let query = `?from=${from}`
                response.record({ //TRANSCRIBING SHOULD BE ADDED
                    timeout: 5,
                    action: process.env.FINISH_CALL_URL,
                    recordingStatusCallback: process.env.SEND_TG_MSG_URL+query
                });
                
                // dynamoUpdateParams.shouldItemUpdate = true;
                // dynamoUpdateParams.method = method;
            }else{
                console.error('SQS msg could not be sent, cehck logs for more details');
                //HANDLE CASE WHERE THE RPC REQUEST WAS NOT SUCCESFUL 
                //MAYBE A SECOND TRY SHOULD BE ATTEMPETED OR AT LEAST SEND A MESSAGE TO EVERYONE
                //NOTE: SINCE LAST FIRMWARE MAJOR CHANGES, THE RESPONSE'S BODY HAS BEEN A PROMISE, IT SHOULD BE CORRECTED
            }
            
        } catch (e) {
            console.error('Error al activar alarma revisar registros de dispositivo ' + deviceId);
            console.error(e);
            response.say(
                {
                    language: 'es-MX'
                },
                "La alarma no pudo ser activada, por favor vuelve a intentar o contacte a Segurired."
            );
        }
    } else if (queryParams.run === 'deactivate') {
        try {
            let method = '';
            let params = {trigger: false, emg: false};
            if(parsedBody.Digits === '1'){
                method = "set_state"
            }else{
                console.log(queryParams.retry);
                if(queryParams.retry === 'false'){
                    let query = `?deviceId=${deviceId}&run=${queryParams.run}&retry=true`
                    let gather = response.gather({
                        input: 'dtmf',
                        timeout: 10,
                        numDigits: 1,
                        action: process.env.GATHER_URL + query
                    });
                    gather.say(
                        {
                            language: 'es-MX'
                        },
                        "Se introdujo un número incorrecto por favor presione uno para desactivar alarma"
                    );
                }else{
                    response.say(
                        {
                            language: 'es-MX'
                        },
                        "Se introdujo un número incorrecto nuevamente por lo tanto se cancela la peticion, hasta luego."
                    );
                    response.hangup(); 
                }
                return sendTwiml(response)
            }
             //A SQS MSG SHOULD BE SENT HERE
             let SQSparams = {
                DelaySeconds: 0,
                MessageAttributes: {
                    "method":{
                        DataType:  "String",
                        StringValue: method
                    },
                    "deviceID":{
                        DataType:  "String",
                        StringValue: deviceId
                    },
                    "trigger":{
                        DataType:  "String",
                        StringValue: params.trigger.toString()
                    },
                    "emg":{
                        DataType:  "String",
                        StringValue: params.trigger.toString()
                    }
                },
                MessageBody: "rpcRequest",
                QueueUrl: process.env.SQS_URL
            }
            let answerSQS = await sendMessage(SQSparams);
            console.log(answerSQS);
            response.say(
                {
                    language: 'es-MX'
                },
                "Alarma desactivada, gracias."
            );
            //dynamoUpdateParams.shouldItemUpdate = true;
        } catch (e) {
            console.error('Error al desactivar alarma revisar registros de dispositivo ' + deviceId);
            console.error(e);
            response.say(
                {
                    language: 'es-MX'
                },
                "La alarma no pudo ser desactivada, por favor vuelve a intentar o contacte a Segurired."
            );
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

const sendTwiml = (twiml: any) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml"
        },
        body: twiml.toString()
    };
};

const parseGatherBody = (body: string) => {
    let pairsKeyValue = body.split('&');
    let parsedBody = {};
    pairsKeyValue.forEach((pair) => {
        let separated = pair.split('=');
        parsedBody[separated[0]] = separated[1];
    });
    return parsedBody
}

const updateAlarmStatus = async (deviceId: string, action: string, method: string) => {
    let newActiveValue = action === 'activate' ? true : false;
    let newAlertValue = method === 'actEm' ? true : false;
    let answer = await updateItem(
        {
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
        }
    );
    return answer;
}