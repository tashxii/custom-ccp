const CONNECT_NAME = ""
const REGION = "ap-northeast-1"
const ACCOUNT_ID= ""
const INSTANCE_ID=""
const QUEUE_ID=""

const config = {
  "ccpUrl":`https://${CONNECT_NAME}.my.connect.aws/connect/ccp-v2`,
  "queueARN":`arn:aws:connect:${REGION}:${ACCOUNT_ID}:instance/${INSTANCE_ID}/queue/${QUEUE_ID}`,
  "instanceARN":`arn:aws:connect:${REGION}:${ACCOUNT_ID}:instance/${INSTANCE_ID}`
}

export default config;