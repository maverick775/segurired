"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putSecretValue = exports.getSecretValue = void 0;
// Load the AWS SDK
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const secretsManager = new aws_sdk_1.default.SecretsManager({
    region: process.env.REGION
});
exports.getSecretValue = async (secretName) => {
    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({ SecretId: secretName }, function (err, result) {
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
exports.putSecretValue = async (updateParams) => {
    return new Promise((resolve, reject) => {
        let params = JSON.stringify(updateParams);
        secretsManager.putSecretValue(updateParams, function (err, result) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlY3JldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsbUJBQW1CO0FBQ25CLHNEQUEwQjtBQUUxQixNQUFNLGNBQWMsR0FBRyxJQUFJLGlCQUFHLENBQUMsY0FBYyxDQUFDO0lBQzFDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU07Q0FDN0IsQ0FBQyxDQUFDO0FBT1UsUUFBQSxjQUFjLEdBQUcsS0FBSyxFQUFFLFVBQWtCLEVBQUMsRUFBRTtJQUN0RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLEVBQUUsVUFBUyxHQUFHLEVBQUUsTUFBTTtZQUN0RSxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDZjtpQkFDSTtnQkFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBO0FBRVksUUFBQSxjQUFjLEdBQUcsS0FBSyxFQUFDLFlBQWdDLEVBQUUsRUFBRTtJQUNwRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsVUFBUyxHQUFHLEVBQUMsTUFBTTtZQUMzRCxJQUFHLEdBQUcsRUFBQztnQkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDZjtpQkFBSTtnQkFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBIn0=