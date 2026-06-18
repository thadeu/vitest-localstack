module.exports = {
  // https://docs.localstack.cloud/aws/feature-coverage/
  image: process.env.LOCALSTACK_IMAGE || 'localstack/localstack:4.4.0',
  services: ['dynamodb', 'kinesis', 's3'],
  showLog: JSON.parse(process.env.LOCALSTACK_DEBUG || false),
  autoPullImage: true,
  DynamoDB: [
    {
      TableName: `users_test`,
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
      ],
    },
  ],
}
