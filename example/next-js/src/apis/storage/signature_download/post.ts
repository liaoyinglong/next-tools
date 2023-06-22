// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 申请文件下载的临时授权
 * @tags 文件存储相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%96%87%E4%BB%B6%E5%AD%98%E5%82%A8%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/createDownloadSignature
 */
export const storageSignatureDownloadPostApi = new RequestBuilder<storageSignatureDownloadPostApi.Req, storageSignatureDownloadPostApi.Res>({
  url: '/storage/signature:download',
  method: 'post',
  requestFn,
});

export namespace storageSignatureDownloadPostApi {
 export interface Req {
  /**
   * 文件的路径或文件的名字
   */
  source: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  fileName?: string;
  signatureUrl?: string;
  expire?: number;
  [k: string]: unknown;
}

};