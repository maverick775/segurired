"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const utils_1 = require("../../utils");
const sqs_1 = require("../../utils/sqs");
const sqs = new aws_sdk_1.default.SQS;
const SQS_URL = process.env.SQS_URL;
exports.handler = async (event, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let message = event.Records[0];
    console.log(message);
    let response = {};
    if (message) {
        if (message.body === 'rpcRequest') {
            let RPCparams = {
                method: (_b = (_a = message.messageAttributes) === null || _a === void 0 ? void 0 : _a.method) === null || _b === void 0 ? void 0 : _b.stringValue,
                params: {
                    trigger: ((_d = (_c = message.messageAttributes) === null || _c === void 0 ? void 0 : _c.trigger) === null || _d === void 0 ? void 0 : _d.stringValue) === 'true',
                    emg: ((_f = (_e = message.messageAttributes) === null || _e === void 0 ? void 0 : _e.emg) === null || _f === void 0 ? void 0 : _f.stringValue) === 'true'
                }
            };
            let deviceID = (_h = (_g = message.messageAttributes) === null || _g === void 0 ? void 0 : _g.deviceID) === null || _h === void 0 ? void 0 : _h.stringValue;
            console.log(RPCparams);
            let thingsAnswer = await utils_1.sendRPCRequest(deviceID, RPCparams);
            console.log(thingsAnswer);
            let deleteParams = {
                QueueUrl: SQS_URL,
                ReceiptHandle: message.receiptHandle
            };
            let sqsAnswer = await sqs_1.deleteMessage(deleteParams);
            console.log(sqsAnswer);
            response = {
                statusCode: 200,
                body: JSON.stringify(event.Records)
            };
        }
    }
    else {
        console.error('Message could not be retrieved');
        response = {
            statusCode: 500,
            body: JSON.stringify(event.Records)
        };
    }
    return response;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjUmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJwY1JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQTBCO0FBQzFCLHVDQUE2QztBQUM3Qyx5Q0FBZ0Q7QUFFaEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxDQUFDLEdBQUcsQ0FBQztBQUN4QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUV2QixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFOztJQUM1QyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUcsT0FBTyxFQUFDO1FBQ1AsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtZQUMvQixJQUFJLFNBQVMsR0FBRztnQkFDWixNQUFNLGNBQUUsT0FBTyxDQUFDLGlCQUFpQiwwQ0FBRSxNQUFNLDBDQUFFLFdBQVc7Z0JBQ3RELE1BQU0sRUFBRTtvQkFDSixPQUFPLEVBQUUsYUFBQSxPQUFPLENBQUMsaUJBQWlCLDBDQUFFLE9BQU8sMENBQUUsV0FBVyxNQUFLLE1BQU07b0JBQ25FLEdBQUcsRUFBRSxhQUFBLE9BQU8sQ0FBQyxpQkFBaUIsMENBQUUsR0FBRywwQ0FBRSxXQUFXLE1BQUssTUFBTTtpQkFDOUQ7YUFDSixDQUFDO1lBQ0YsSUFBSSxRQUFRLGVBQUcsT0FBTyxDQUFDLGlCQUFpQiwwQ0FBRSxRQUFRLDBDQUFFLFdBQVcsQ0FBQztZQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksWUFBWSxHQUFHLE1BQU0sc0JBQWMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixJQUFJLFlBQVksR0FBRztnQkFDZixRQUFRLEVBQUUsT0FBTztnQkFDakIsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhO2FBQ3ZDLENBQUM7WUFDRixJQUFJLFNBQVMsR0FBRyxNQUFNLG1CQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixRQUFRLEdBQUc7Z0JBQ1AsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzthQUN0QyxDQUFDO1NBQ0w7S0FDSjtTQUFJO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ2hELFFBQVEsR0FBRztZQUNQLFVBQVUsRUFBRSxHQUFHO1lBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztTQUN0QyxDQUFDO0tBQ0w7SUFDRCxPQUFPLFFBQVEsQ0FBQTtBQUNuQixDQUFDLENBQUMifQ==