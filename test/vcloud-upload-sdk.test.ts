import VcloudClient from '../src/vcloud-upload-sdk'

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('DummyClass is instantiable', () => {
    expect(new VcloudClient()).toBeInstanceOf(VcloudClient)
  })
})
