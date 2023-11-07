const { resolve } = require('path')

const localstackConfig = {
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
  region: 'us-east-1',
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
}

const configureMockSDK = (sdk) => {
  sdk.config.update(localstackConfig)
}

const setup = resolve(__dirname, 'setup.js')
const teardown = resolve(__dirname, 'teardown.js')

module.exports = {
  configureMockSDK,
  localstackConfig,
  setup,
  teardown,
}
