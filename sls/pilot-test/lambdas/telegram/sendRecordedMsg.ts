import { APIGatewayEvent } from "aws-lambda";

export const handler = async (event: APIGatewayEvent) => {
    
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const body = event.body;
    let parsedBody = parseTwilioBody(body);
    console.log(parsedBody);
    console.log(decodeURIComponent(parsedBody.RecordingUrl));

    return {
        statusCode: 200,
        body: {}
    };
}

const parseTwilioBody = (body: string | null) => {
    let pairsKeyValue = body?.split('&');
        if(pairsKeyValue){
        let parsedBody = {};
        pairsKeyValue?.forEach((pair) => {
            let separated = pair.split('=');
            parsedBody[separated[0]] = separated[1];
        });
        return parsedBody;
    }else{
        throw new Error('El body pasado a parseTwilio fue incorrecto');
    }
    
}