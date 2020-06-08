import VcloudClient from '../src/vcloud-upload-sdk'

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('DummyClass is instantiable', () => {
    const client = new VcloudClient({
      appKey: '123',
      appSecret: '456',
      trunkSize: 4 * 1024 * 1024
    })
    client.upload().then(() => {})
    expect(client).toBeInstanceOf(VcloudClient)
  })
})
