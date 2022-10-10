// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 创建文件上传的临时授权
 * @tags 文件存储相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%96%87%E4%BB%B6%E5%AD%98%E5%82%A8%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/createStorageRequest
 */
export const storageSignatureUploadPostApi = new RequestBuilder<storageSignatureUploadPostApi.Req, storageSignatureUploadPostApi.Res>({
  url: '/storage/signature:upload',
  method: 'post',
  requestFn,
  
});

export namespace storageSignatureUploadPostApi {
 export interface Req {
  /**
   * 文件上传的业务类型
   */
  bizType: string;
  /**
   * 文件资源的类型
   */
  contentType: string;
  /**
   * 附加参数，不同的业务场景可能需要不同的附加参数
   */
  extra?: {
    /**
     * 附加参数，不同的业务场景可能需要不同的附加参数
     */
    [k: string]: {
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  /**
   * 真正用于文件上传的URL
   */
  url?: string;
  /**
   * 在文件上传时请求头中的参数信息
   */
  headers?: {
    /**
     * 在文件上传时请求头中的参数信息
     */
    [k: string]: string;
  };
  /**
   * 请求的方法
   */
  method?: string;
  /**
   * 有效期剩余时间.单位:毫秒
   */
  expire?: number;
  /**
   * 文件上传成功后的资源地址，如果是私密文件，则格式为'private:xxxx',此时使用此key申请临时访问权限.
   */
  source?: string;
  [k: string]: unknown;
}

};