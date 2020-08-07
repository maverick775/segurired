"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanItems = exports.getItem = exports.updateItem = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dynamoDB = new aws_sdk_1.default.DynamoDB.DocumentClient();
exports.updateItem = async (params) => {
    const query = Object.assign({ TableName: 'registroAVP' }, params);
    return new Promise((resolve, reject) => {
        dynamoDB.update(query, (err, result) => {
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
exports.getItem = async (params) => {
    const query = Object.assign({ TableName: 'registroAVP' }, params);
    return new Promise((resolve, reject) => {
        dynamoDB.get(query, (err, result) => {
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
exports.scanItems = async (params) => {
    const query = Object.assign({ TableName: 'registroAVP' }, params);
    return new Promise((resolve, reject) => {
        dynamoDB.scan(query, (err, result) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkeW5hbW9kYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxzREFBMEI7QUFFMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQWdDdEMsUUFBQSxVQUFVLEdBQUcsS0FBSyxFQUMzQixNQUF3QixFQUM2QixFQUFFO0lBQ3ZELE1BQU0sS0FBSyxtQkFDUCxTQUFTLEVBQUUsYUFBYSxJQUNyQixNQUFNLENBQ1osQ0FBQztJQUVGLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2Y7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25CO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUVXLFFBQUEsT0FBTyxHQUFHLEtBQUssRUFDeEIsTUFBcUIsRUFDNkIsRUFBRTtJQUNwRCxNQUFNLEtBQUssbUJBQ1AsU0FBUyxFQUFFLGFBQWEsSUFDckIsTUFBTSxDQUNaLENBQUM7SUFFRixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ2hDLElBQUksR0FBRyxFQUFFO2dCQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNmO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFFVyxRQUFBLFNBQVMsR0FBRyxLQUFLLEVBQzFCLE1BQXVCLEVBQ3dCLEVBQUU7SUFDakQsTUFBTSxLQUFLLG1CQUNQLFNBQVMsRUFBRSxhQUFhLElBQ3JCLE1BQU0sQ0FDWixDQUFDO0lBRUYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNuQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNqQyxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDZjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDIn0=