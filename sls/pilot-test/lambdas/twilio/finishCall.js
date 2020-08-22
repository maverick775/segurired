"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const twilio_1 = require("twilio");
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
    response.say({
        language: 'es-MX'
    }, "Su mensaje fue grabado y será compartido con los demás miembros, hasta luego.");
    response.hangup();
    return sendTwiml(response);
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
const sendTwiml = (twiml) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml"
        },
        body: twiml.toString()
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluaXNoQ2FsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpbmlzaENhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQStCO0FBRS9CLGdCQUFnQjtBQUNoQixxREFBcUQ7QUFFeEMsUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQXNCLEVBQUUsRUFBRTtJQUNwRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3hCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztJQUM5QyxJQUFJLFVBQVUsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRXpCLFFBQVEsQ0FBQyxHQUFHLENBQ1I7UUFDSSxRQUFRLEVBQUUsT0FBTztLQUNwQixFQUNELCtFQUErRSxDQUNsRixDQUFDO0lBQ0YsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xCLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQTtBQUVELE1BQU0sZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDckMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQzNCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sVUFBVSxDQUFBO0FBQ3JCLENBQUMsQ0FBQTtBQUVELE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7SUFDN0IsT0FBTztRQUNILFVBQVUsRUFBRSxHQUFHO1FBQ2YsT0FBTyxFQUFFO1lBQ0wsY0FBYyxFQUFFLGlCQUFpQjtTQUNwQztRQUNELElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFO0tBQ3pCLENBQUM7QUFDTixDQUFDLENBQUMifQ==