// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 获取2FA验证key
 * @tags 用户验证相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%94%A8%E6%88%B7%E9%AA%8C%E8%AF%81%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getAuthentication
 */
export const publicVerify2FaGetApi = new RequestBuilder<publicVerify2FaGetApi.Req, publicVerify2FaGetApi.Res>({
  url: '/public/verify/2fa',
  method: 'get',
  requestFn,
  
  
});

export namespace publicVerify2FaGetApi {
 export interface Req {
  token: string;
  [k: string]: unknown;
}

 
 /**
 * 获取2FA验证key
 */
export interface Res {
  /**
   * 验证key
   */
  verifyKey?: string;
  /**
   * 验证码二维码
   */
  verifyImg?: string;
  [k: string]: unknown;
}

};