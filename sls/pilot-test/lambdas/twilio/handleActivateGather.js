"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const querystring_1 = __importDefault(require("querystring"));
// 4. Pause call
// 4.1 if call still going, tell visitor to try again
exports.handler = async (event) => {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    const { Body } = querystring_1.default.parse(event.body);
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
const sendTwiml = (twiml) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml"
        },
        body: twiml.toString()
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlQWN0aXZhdGVHYXRoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJoYW5kbGVBY3RpdmF0ZUdhdGhlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFJQSw4REFBNkI7QUFDN0IsZ0JBQWdCO0FBQ2hCLHFEQUFxRDtBQUV4QyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBc0IsRUFBRSxFQUFFO0lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxxQkFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFDLENBQUM7SUFDckMsNERBQTREO0lBQzVELHlEQUF5RDtJQUN6RCw0QkFBNEI7SUFDNUIsaUJBQWlCO0lBQ2pCLHlCQUF5QjtJQUN6QixtQkFBbUI7SUFDbkIsS0FBSztJQUNMLHdEQUF3RDtJQUN4RCxxRUFBcUU7SUFFckUsaUJBQWlCO0lBQ2pCLHdCQUF3QjtJQUN4QixLQUFLO0lBQ0wsaUNBQWlDO0lBQ2pDLDZCQUE2QjtBQUNqQyxDQUFDLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQVUsRUFBRSxFQUFFO0lBQzdCLE9BQU87UUFDSCxVQUFVLEVBQUUsR0FBRztRQUNmLE9BQU8sRUFBRTtZQUNMLGNBQWMsRUFBRSxpQkFBaUI7U0FDcEM7UUFDRCxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtLQUN6QixDQUFDO0FBQ04sQ0FBQyxDQUFDIn0=