export const handler = async (event: APIGatewayEvent) => {
    
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const body = event.body;
    let queryParams = event.queryStringParameters;
    let parsedBody = parseTwilioBody(body);
    console.log(parsedBody);
    console.log(queryParams);

    return {
        statusCode: 200,
        body: {}
    };
}

const parseTwilioBody = (body: string) => {
    let pairsKeyValue = body.split('&');
    let parsedBody = {};
    pairsKeyValue.forEach((pair) => {
        let separated = pair.split('=');
        parsedBody[separated[0]] = separated[1];
    });
    return parsedBody
}