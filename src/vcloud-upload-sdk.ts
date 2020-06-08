// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import axios from 'axios'
import * as crypto from 'crypto'

export interface Config {
  appKey: string
  appSecret: string
  nonce: string
  curTime: string
  trunkSize: number
}

export default class VcloudClient {
  config: Config

  constructor(config: Omit<Config, 'nonce' | 'curTime'>) {
    this.config = {
      ...config,
      nonce: Math.round(Math.random() * Math.pow(10, 16)).toString(),
      curTime: Math.round(Date.now() / 1000).toString()
    }
  }

  private getCheckSum() {
    const { appSecret, nonce, curTime } = this.config
    return crypto
      .createHash('sha1')
      .update(appSecret)
      .update(nonce)
      .update(curTime)
  }

  private buildHeader() {
    return {
      AppKey: this.config.appKey,
      Nonce: this.config.nonce,
      CurTime: this.config.curTime,
      CheckSum: this.getCheckSum()
    }
  }

  private async init(filename: string) {
    return axios.post('http://vcloud.163.com/app/vod/upload/init', {
      headers: this.buildHeader(),
      body: {
        originalFileName: filename
      }
    })
  }

  async upload() {
    const res = await this.init('abc.txt')
    console.log(res)
  }
}
