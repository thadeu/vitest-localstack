import AWS from 'aws-sdk'
import { it, expect } from 'vitest'

import { configureMockSDK } from '../aws'
configureMockSDK(AWS)

const Table = new AWS.DynamoDB.DocumentClient()

it('should insert item into table', async () => {
  await Table.put({ TableName: 'users_test', Item: { pk: '1', sk: 'localstack' } }).promise()

  const { Count } = await Table.scan({ TableName: 'users_test' }).promise()
  expect(Count).toBe(1)
})
