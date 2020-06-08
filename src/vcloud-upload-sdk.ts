// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

export interface Config {
  appKey: string
  appSecret: string
  nonce: string
  curTime: number
  trunkSize: number
}

export default class VcloudClient {
  config: Config

  constructor(config: Omit<Config, 'nonce' | 'curTime'>) {
    this.config = {
      ...config,
      nonce: Math.round(Math.random() * Math.pow(10, 16)).toString(),
      curTime: Math.round(Date.now() / 1000)
    }
  }
}
