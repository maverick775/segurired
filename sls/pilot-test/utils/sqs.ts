import AWS from "aws-sdk";

const sqs = new AWS.SQS;
AWS.config.update({region: process.env.REGION});

interface sqsMsg {
   DelaySeconds: number,
   MessageAttributes: any,
   MessageBody: string,
   QueueUrl: string
};

export const sendMessage = async (message: sqsMsg)=>{
    return new Promise((resolve, reject) => {
        sqs.sendMessage(message, function(err, result) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

export const receiveMessage = async (receiveParams: any) =>{
    return new Promise((resolve, reject) => {
        sqs.receiveMessage(receiveParams, function(err, result) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}

export const deleteMessage = async (deleteParams: any) => {
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