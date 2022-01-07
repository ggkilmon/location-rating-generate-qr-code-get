const { AwesomeQR } = require('awesome-qr');
const { v4:uuidv4  } = require('uuid');
var AWS = require('aws-sdk');

var ssm = new AWS.SSM();
var s3 = new AWS.S3();

exports.handler = async function(event, context) {
    //get cloudfront url
    var paramBaseUrl = await getParam('/location-rating/base-url');
    var baseUrl = paramBaseUrl.Parameter.Value;

    //get bucket
    var paramBucket = await getParam('/location-rating/qr-bucket');
    var bucket = paramBucket.Parameter.Value;

    //generate guid
    var guid = uuidv4();

    //generate qr code
    const buffer = await new AwesomeQR({
        text: `${baseUrl}?qr-guid=${guid}`,
        size: 500,
    }).draw();

    //save to s3
    await saveQr(buffer, bucket, guid);

    return {
        body: `{"qr-code-url": "https://${bucket}.s3.amazonaws.com/${guid}.png"}`,
        bodyEncoding: 'text',
        headers: {
            'Content-Type': 'application/json',
        },
        status: 200,
    };
}

async function getParam(name) {
    return await ssm.getParameter({
        Name: name,
    }).promise();
}

async function saveQr(buffer, bucket, guid){
    await s3.putObject({
        Body: buffer,
        Bucket: bucket,
        Key: `${guid}.png`,
        ContentType: 'image/png',
    }).promise();
}