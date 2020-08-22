
import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
import { sendRPCRequest } from "../../utils";
import { updateItem } from "../../utils/dynamodb";
import qs from "querystring";
// 4. Pause call
// 4.1 if call still going, tell visitor to try again

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
            let method = '';
            if(parsedBody.Digits === '1'){
                method = "actEm";
            }else if(parsedBody.Digits === '2'){
                method = "actAl";
            }else{
                //HANDLE DIFFERENT RESPONSE CASE
            }
            let params = {
                "method": method,
                "params": {}
            };
            let thingsAnswer = await sendRPCRequest(deviceId, params);
            console.log(thingsAnswer);
            //if(thingsAnswer.status >= 200 && thingsAnswer.status < 300){
                console.log('Alarma activada');
                response.say(
                    {
                        language: 'es-MX'
                    },
                    "Alarma activada, gracias. Para agregar mensaje de voz grabe después del tono"
                );
                response.record({
                    timeout: 5,
                    action: process.env.FINISH_CALL_URL,
                    recordingStatusCallback: process.env.SEND_TG_MSG_URL
                });
                
                dynamoUpdateParams.shouldItemUpdate = true;
                dynamoUpdateParams.method = method;
            // }else{
                //HANDLE CASE WHERE THE RPC REQUEST WAS NOT SUCCESFUL 
                //NOTE: SINCE LAST FIRMWARE MAJOR CHANGES, THE RESPONSE'S BODY HAS BEEN A PROMISE, IT SHOULD BE CORRECTED
            // }
            
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
            let params = {
                "method": "desAl",
                "params": {}
            };
            let thingsAnswer = await sendRPCRequest(deviceId, params);
            console.log(thingsAnswer);
            console.log('Alarma desactivada');
            response.say(
                {
                    language: 'es-MX'
                },
                "Alarma desactivada, gracias."
            );
            dynamoUpdateParams.shouldItemUpdate = true;
        } catch (e) {
            console.error('Error al activar alarma revisar registros de dispositivo ' + deviceId);
            console.error(e);
            response.say(
                {
                    language: 'es-MX'
                },
                "La alarma no pudo ser desactivada, por favor vuelve a intentar o contacte a Segurired."
            );
        }
    }
    //UPDATE DYNAMODB 
    if (dynamoUpdateParams.shouldItemUpdate) {
        try{
            let answer = await updateAlarmStatus(deviceId, queryParams.run, dynamoUpdateParams.method);
            console.log({
                title: 'DB updated',
                message: answer
            });
        }catch(e){
            console.error('Dynamo no pudo ser actualizado');
            console.error(e);
        }
    }
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