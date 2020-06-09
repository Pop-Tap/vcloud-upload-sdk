// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import axios from 'axios'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as through2 from 'through2'

export interface Config {
  appKey: string
  appSecret: string
  nonce: string
  curTime: string
  chunkSize?: number
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

type IpResponse = {
  lbs: string
  upload: string[]
}

type UploadConfig = {
  token: string
  bucket: string
  object: string
  offset: number
  complete: boolean
  context?: string
}

type UploadChunkResponse = {
  requestId: string
  offset: number
  context: string
  callbackRetMsg: string
}

export default class VcloudClient {
  config: Required<Config>

  constructor(config: Omit<Config, 'nonce' | 'curTime'>) {
    this.config = {
      ...{
        chunkSize: 4 * 1024 * 1024,
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

  private async init(filename: string): Promise<InitResponse> {
    return axios
      .post<InitResponse>(
        'http://vcloud.163.com/app/vod/upload/init',
        {
          originFileName: filename
        },
        {
          headers: this.buildHeaders()
        }
      )
      .then(res => res.data)
  }

  private getIpAddress(bucket: string): Promise<IpResponse> {
    return axios
      .get<IpResponse>('http://wanproxy.127.net/lbs', {
        params: {
          version: '1.0',
          bucketname: bucket
        }
      })
      .then(res => res.data)
  }

  private uploadChunk(
    ip: string,
    buffer: Buffer,
    config: UploadConfig
  ): Promise<UploadChunkResponse> {
    const params = {
      bucket: config.bucket,
      object: config.object,
      offset: config.offset,
      complete: config.complete,
      version: '1.0',
      context: config.context
    }
    return axios
      .post<UploadChunkResponse>(`${ip}/${config.bucket}/${config.object}`, buffer, {
        headers: {
          'x-nos-token': config.token
        },
        params
      })
      .then(res => res.data)
  }

  async upload(path: string) {
    const initRes = await this.init('abc.mp4')
    const ipRes = await this.getIpAddress(initRes.ret.bucket)
    if (ipRes.upload.length === 0) {
      throw new Error('无法找到有效的上传地址')
    }
    const ip = ipRes.upload[0]
    return new Promise((resolve, reject) => {
      let lastChunk: Buffer
      let lastContext: string
      let offset = 0

      fs.createReadStream(path, { highWaterMark: this.config.chunkSize })
        .pipe(
          through2(
            (chunk, enc, cb) => {
              if (lastChunk) {
                const config: UploadConfig = {
                  token: initRes.ret.xNosToken,
                  bucket: initRes.ret.bucket,
                  object: initRes.ret.object,
                  offset,
                  complete: false,
                  context: lastContext
                }
                this.uploadChunk(ip, chunk, config).then(response => {
                  lastChunk = chunk
                  offset = response.offset
                  lastContext = response.context
                  cb(null, chunk)
                })
              }
            },
            cb => {
              const config: UploadConfig = {
                token: initRes.ret.xNosToken,
                bucket: initRes.ret.bucket,
                object: initRes.ret.object,
                offset,
                complete: true,
                context: lastContext
              }
              this.uploadChunk(ip, lastChunk, config)
              cb()
            }
          )
        )
        .on('data', function() {})
        .on('end', function() {})
    })
  }
}
