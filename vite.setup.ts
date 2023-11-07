import localStackSetup from './setup'
import localStackTeardown from './teardown'

export async function setup() {
  await localStackSetup()
}

export async function teardown() {
  await localStackTeardown()
}
