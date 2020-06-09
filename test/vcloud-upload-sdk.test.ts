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
      appKey: process.env.APP_KEY,
      appSecret: process.env.APP_SECRET,
      chunkSize: 4 * 1024 * 1024
    })
    client
      .upload(
        '/var/folders/lg/ztn7z9450gl3fv2k30mtrft80000gn/T/91cb1700-c007-4af0-a820-338f4700413e.mp4'
      )
      .then(result => {
        console.log(result)
      })
    expect(client).toBeInstanceOf(VcloudClient)
  })
})
