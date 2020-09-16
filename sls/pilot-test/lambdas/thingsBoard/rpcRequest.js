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
    var _a, _b, _c, _d;
    let message = event.Records[0];
    console.log(message);
    let response = {};
    if (message) {
        if (message.body === 'rpcRequest') {
            let RPCparams = {
                method: (_b = (_a = message.messageAttributes) === null || _a === void 0 ? void 0 : _a.method) === null || _b === void 0 ? void 0 : _b.stringValue,
                params: {}
            };
            let deviceID = (_d = (_c = message.messageAttributes) === null || _c === void 0 ? void 0 : _c.deviceID) === null || _d === void 0 ? void 0 : _d.stringValue;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjUmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJwY1JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQTBCO0FBQzFCLHVDQUE2QztBQUM3Qyx5Q0FBZ0Q7QUFFaEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxDQUFDLEdBQUcsQ0FBQztBQUN4QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUV2QixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFOztJQUM1QyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUcsT0FBTyxFQUFDO1FBQ1AsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtZQUMvQixJQUFJLFNBQVMsR0FBRztnQkFDWixNQUFNLGNBQUUsT0FBTyxDQUFDLGlCQUFpQiwwQ0FBRSxNQUFNLDBDQUFFLFdBQVc7Z0JBQ3RELE1BQU0sRUFBRSxFQUFFO2FBQ2IsQ0FBQztZQUNGLElBQUksUUFBUSxlQUFHLE9BQU8sQ0FBQyxpQkFBaUIsMENBQUUsUUFBUSwwQ0FBRSxXQUFXLENBQUM7WUFDaEUsSUFBSSxZQUFZLEdBQUcsTUFBTSxzQkFBYyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFCLElBQUksWUFBWSxHQUFHO2dCQUNmLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7YUFDdkMsQ0FBQztZQUNGLElBQUksU0FBUyxHQUFHLE1BQU0sbUJBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLFFBQVEsR0FBRztnQkFDUCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO2FBQ3RDLENBQUM7U0FDTDtLQUNKO1NBQUk7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDaEQsUUFBUSxHQUFHO1lBQ1AsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQ3RDLENBQUM7S0FDTDtJQUNELE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUMsQ0FBQyJ9