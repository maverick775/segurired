import AWS from "aws-sdk";
import { sendRPCRequest } from "../../utils";
import { deleteMessage } from "../../utils/sqs";

const sqs = new AWS.SQS;
const SQS_URL = process.env.SQS_URL;

export const handler = async (event, context) => {
    let message = event.Records[0];
    console.log(message);
    let response = {};
    if(message){
        if (message.body === 'rpcRequest') {
            let RPCparams = {
                method: message.messageAttributes?.method?.stringValue,
                params: {
                    trigger: message.messageAttributes?.trigger?.stringValue === 'true',
                    emg: message.messageAttributes?.emg?.stringValue === 'true'
                }
            };
            let deviceID = message.messageAttributes?.deviceID?.stringValue;
            console.log(RPCparams);
            let thingsAnswer = await sendRPCRequest(deviceID, RPCparams);
            console.log(thingsAnswer);
            let deleteParams = {
                QueueUrl: SQS_URL,
                ReceiptHandle: message.receiptHandle
            };
            let sqsAnswer = await deleteMessage(deleteParams);
            console.log(sqsAnswer);
            response = {
                statusCode: 200,
                body: JSON.stringify(event.Records)
            };
        }
    }else{
        console.error('Message could not be retrieved');
        response = {
            statusCode: 500,
            body: JSON.stringify(event.Records)
        };
    }
    return response
};
