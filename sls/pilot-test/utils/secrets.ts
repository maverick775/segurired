// Load the AWS SDK
import AWS from "aws-sdk";

const secretsManager = new AWS.SecretsManager({
    region: process.env.REGION  
});

interface updateSecretParams {
    SecretId: string;
    SecretString: string;
}

export const getSecretValue = async (secretName: string)=>{
    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({SecretId: secretName}, function(err, result) {
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

export const putSecretValue = async(updateParams: updateSecretParams) =>{
    return new Promise((resolve, reject) =>{
        let params = JSON.stringify(updateParams);
        secretsManager.putSecretValue(updateParams, function(err,result){
            if(err){
                console.error(err);
                reject(err);
            }else{
                resolve(result);
            }
        });
    });    
}