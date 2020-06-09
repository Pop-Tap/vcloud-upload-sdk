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
  trunkSize?: number
}

type InitResponse = {
  ret: {
    xNosToken: string
    bucket: string
    object: string
  }
  requestId: string
  code: number
}

export default class VcloudClient {
  config: Config

  constructor(config: Omit<Config, 'nonce' | 'curTime'>) {
    this.config = {
      ...{
        trunkSize: 4 * 1024 * 1024,
        nonce: Math.round(Math.random() * Math.pow(10, 16)).toString(),
        curTime: Math.round(Date.now() / 1000).toString()
      },
      ...config
    }
  }

  private getCheckSum(): string {
    const { appSecret, nonce, curTime } = this.config
    return crypto
      .createHash('sha1')
      .update(appSecret)
      .update(nonce)
      .update(curTime)
      .digest('hex')
  }

  private buildHeaders(): { [key: string]: string } {
    return {
      AppKey: this.config.appKey,
      Nonce: this.config.nonce,
      CurTime: this.config.curTime,
      CheckSum: this.getCheckSum()
    }
  }

  private async init(filename: string) {
    return axios.post<InitResponse>(
      'http://vcloud.163.com/app/vod/upload/init',
      {
        originFileName: filename
      },
      {
        headers: this.buildHeaders()
      }
    )
  }

  async upload() {
    const res = await this.init('abc.mp4')
    console.log(res)
  }
}
