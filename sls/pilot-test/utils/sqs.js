"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.receiveMessage = exports.sendMessage = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sqs = new aws_sdk_1.default.SQS;
aws_sdk_1.default.config.update({ region: process.env.REGION });
;
exports.sendMessage = async (message) => {
    return new Promise((resolve, reject) => {
        sqs.sendMessage(message, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.receiveMessage = async (receiveParams) => {
    return new Promise((resolve, reject) => {
        sqs.receiveMessage(receiveParams, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
exports.deleteMessage = async (deleteParams) => {
    return new Promise((resolve, reject) => {
        sqs.deleteMessage(deleteParams, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3FzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHNEQUEwQjtBQUUxQixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLENBQUMsR0FBRyxDQUFDO0FBQ3hCLGlCQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFPL0MsQ0FBQztBQUVXLFFBQUEsV0FBVyxHQUFHLEtBQUssRUFBRSxPQUFlLEVBQUMsRUFBRTtJQUNoRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQVMsR0FBRyxFQUFFLE1BQU07WUFDekMsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2Y7aUJBQ0k7Z0JBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25CO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQTtBQUVZLFFBQUEsY0FBYyxHQUFHLEtBQUssRUFBRSxhQUFrQixFQUFFLEVBQUU7SUFDdkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxHQUFHLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxVQUFTLEdBQUcsRUFBRSxNQUFNO1lBQ2xELElBQUksR0FBRyxFQUFFO2dCQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNmO2lCQUNJO2dCQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUE7QUFFWSxRQUFBLGFBQWEsR0FBRyxLQUFLLEVBQUUsWUFBaUIsRUFBRSxFQUFFO0lBQ3JELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsVUFBVSxHQUFHLEVBQUUsTUFBTTtZQUNqRCxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDZjtpQkFDSTtnQkFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDIn0=