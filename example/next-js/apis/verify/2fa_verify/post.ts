// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 验证2FA
 * @tags 用户验证相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%94%A8%E6%88%B7%E9%AA%8C%E8%AF%81%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/authenticationVerify
 */
export const verify2FaVerifyPostApi = new RequestBuilder<verify2FaVerifyPostApi.Req, verify2FaVerifyPostApi.Res>({
  url: '/verify/2fa:verify',
  method: 'post',
  requestFn,
  
  
});

export namespace verify2FaVerifyPostApi {
 /**
 * 2FA验证请求参数
 */
export interface Req {
  /**
   * 验证码
   */
  verifyCode: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = boolean;

};