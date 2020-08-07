  
import { APIGatewayEvent } from "aws-lambda";
import { twiml } from "twilio";
import {sendRPCRequest} from "../../utils/index";
import qs from "querystring";
// 4. Pause call
// 4.1 if call still going, tell visitor to try again

export const handler = async (event: APIGatewayEvent) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const {Body} = qs.parse(event.body!);
    // //DEVICE ID SHOULD BE OBTAINED HERE INSTEAD OF HARDCODING
    // let deviceId = '49934ed0-cb7e-11ea-bab3-ff8fe6e0c30b';
    // //********************** 
    // let params = {
    //     "method": "actAl",
    //     "params": {}
    // };
    // let result =  await sendRPCRequest(deviceId, params);
    // console.log(result);// const response = new twiml.VoiceResponse();

    // response.say({
    //     language: 'es-MX'
    // },
    // "Gracias por tus respuestas");
    //return sendTwiml(response);
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