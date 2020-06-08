// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
export default class VcloudClient {
  appKey: string
  secretKey: string

  constructor(appKey: string, secretKey: string) {
    this.appKey = appKey
    this.secretKey = secretKey
  }
}
