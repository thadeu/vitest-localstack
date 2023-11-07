# vitest-localstack

🥾 A simple way to do testing AWS Services using Vitest

[![ci](https://github.com/thadeu/vitest-localstack/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thadeu/vitest-localstack/actions/workflows/ci.yml)
[![Npm package version](https://badgen.net/npm/v/@thadeu/vitest-localstack)](https://www.npmjs.com/package/@thadeu/vitest-localstack)

## Install

Install via yarn or npm

```bash
$ yarn add -D @thadeu/vitest-localstack
```

or

```bash
$ npm i -D @thadeu/vitest-localstack
```

or directly via Github

```bash
$ npm i -D thadeu/vitest-localstack
```

## Dependencies

- Docker
- [LocalStack Image](https://docs.localstack.cloud/get-started/#starting-localstack-with-docker)
- NodeJS >= 12.x

## Configuration

In your `vite.config.ts`, adding into test object, a globalSetup using `vite.setup.ts`

```js
import { defineConfig } from 'vitest/config'

export default ({ mode }) => {
  return defineConfig({
    test: {
      globalSetup: ['./vite.setup.ts'],
    },
  })
}
```

Create or update your `vite.setup.ts`

```ts
import localStackSetup from '@thadeu/vitest-localstack/setup'
import localStackTeardown from '@thadeu/vitest-localstack/teardown'

export async function setup() {
  await localStackSetup()
}

export async function teardown() {
  await localStackTeardown()
}

```

Create or update your `localstack.config.js` file with your required services, for example.

```js
module.exports = {
  // https://docs.localstack.cloud/aws/feature-coverage/
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
```

| Key           | Value    | Description                                        |
| ------------- | -------- | -------------------------------------------------- |
| readyTimeout  | boolean  | Define timeout in milliseconds to create container |
| autoPullImage | boolean  | Define if we go to download image automatically    |
| showLog       | boolean  | Define show logs for localstack                    |
| services      | [string] | List of AWS Services                               |

> You can define environment `VITEST_LOCALSTACK_AUTO_PULLING` to precede autoPullImage configuration in your CI/CD

## Usage

When you use `configureMockSDK` function, we configure many things to you transparently. This means that you going to use `aws-sdk` normally, without change.

> We will apply yhis

```js
{
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
}
```

But, if you need configure in runtime, enjoy and to do that. Anywhere you can use the `endpoint_url` to access localstack services locally.

So, use custom endpoint `process.env.AWS_ENDPOINT_URL` for general or specific to DynamoDB `process.env.AWS_DYNAMODB_ENDPOINT_URL` in the AWS clients in your code.

For example to use DynamoDB or S3.

```ts
import AWS from 'aws-sdk'

const Table = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.AWS_DYNAMODB_ENDPOINT_URL,
})
```

So, create your tests and then.

An example for DynamoDB.

```ts
import AWS from 'aws-sdk'
import { describe, it, expect } from 'vitest'

import { configureMockSDK } from '@thadeu/vitest-localstack'
configureMockSDK(AWS)

const Table = new AWS.DynamoDB.DocumentClient()

it('should insert item into table', async () => {
  await Table.put({
    TableName: 'users_test',
    Item: { pk: '1', sk: 'vitest-localstack' },
  }).promise()

  const { Count } = await Table.scan({ TableName: 'users_test' }).promise()
  expect(Count).toBe(1)
})
```

An example for S3

```ts
import AWS from 'aws-sdk'
import { describe, it, expect } from 'vitest'

import { configureMockSDK } from '@thadeu/vitest-localstack'
configureMockSDK(AWS)

const s3 = new AWS.S3()

it('must be create a bucket', async () => {
  await s3.createBucket({ Bucket: 'examplebucket' }).promise()

  const { Buckets } = await s3.listBuckets().promise()

  expect(Buckets.length).toBe(1)
  expect(Buckets[0].Name).toBe('examplebucket')
})

```

Usually you go to use other files, class and functions.

```ts
// UserReposity.js
import AWS from 'aws-sdk'
const Table = new AWS.DynamoDB.DocumentClient()

export default class UserReposity {
  static async all(props = {}) {
    return Table.scan({ TableName: 'users', ...props }).promise()
  }

  static async save(props) {
    return Table.put({
      TableName: 'users',
      ...props,
    }).promise()
  }
}

// UserReposity.test.ts
import AWS from 'aws-sdk'
import { describe, it, expect } from 'vitest'

import { configureMockSDK } from '@thadeu/vitest-localstack'
configureMockSDK(AWS)

import UserReposity from './UserReposity'

describe('UserReposity', function () {
  it('should insert item into repository', async () => {
    await UserReposity.save({
      Item: { pk: '1', sk: 'vitest-localstack' },
    })

    const { Count } = await UserReposity.all()
    expect(Count).toBe(1)
  })
})
```

In this moment, all process will be make using [LocalStack](https://github.com/localstack/localstack).

## How Its Works?

Programmatically, we start a docker container with localstack, we run all tests and then, when tests finished, we destroy all containers related

## What services work?

Basically, whatever!

For more AWS Service available visit, https://docs.localstack.cloud/aws/feature-coverage/

## Debugging

You can enabled debug flag using your custom environment.

| Envs                         | Type    |
| ---------------------------- | ------- |
| LOCALSTACK_DEBUG             | boolean |
| VITEST_LOCALSTACK_AUTO_PULLING | boolean |

## CI (Continuous Integration)

- Github Actions, see [.github/workflows/ci](.github/workflows/ci.yml)

Simple example

```yml
name: ci

on: push

jobs:
  test:
    name: test
    runs-on: ubuntu-latest

    services:
      localstack:
        image: localstack/localstack

    defaults:
      run:
        working-directory: ./

    steps:
      - uses: actions/checkout@v2

      - uses: actions/cache@v2
        with:
          path: '**/node_modules'
          key: ${{ runner.os }}-modules-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-modules-

      - name: Setup NodeJS
        uses: actions/setup-node@v2
        with:
          node-version: 18.17

      - name: Install Yarn Dependencies
        run: yarn install --frozen-lockfile

      - name: Yarn tests
        run: yarn test
        env:
          LOCALSTACK_DEBUG: true
          VITEST_LOCALSTACK_AUTO_PULLING: true
```

## Contributing

Once you've made your great commits (include tests, please):

1. Fork this repository
2. Create a topic branch - git checkout -b my_branch
3. Push to your branch - git push origin my_branch
4. Create a pull request
5. That's it!

Please respect the indentation rules and code style. And use 2 spaces, not tabs. And don't touch the version thing or distribution files; this will be made when a new version is going to be release

## License

The Dockerfile and associated scripts and documentation in this project are released under the [MIT License](LICENSE).
