// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 重置2FA
 * @tags 用户验证相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%94%A8%E6%88%B7%E9%AA%8C%E8%AF%81%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/authenticationReset
 */
export const publicVerify2FaResetPutApi = new RequestBuilder<publicVerify2FaResetPutApi.Req, publicVerify2FaResetPutApi.Res>({
  url: '/public/verify/2fa:reset',
  method: 'put',
  requestFn,
  
});

export namespace publicVerify2FaResetPutApi {
 export interface Req {
  /**
   * 重置token
   */
  token: string;
  /**
   * 验证key
   */
  verifyKey: string;
  /**
   * 验证码
   */
  verifyCode: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};