// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 重置密码
 * @tags 后台用户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E5%8F%B0%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/passwordReset
 */
export const publicUsersPasswordResetPutApi = new RequestBuilder<publicUsersPasswordResetPutApi.Req, publicUsersPasswordResetPutApi.Res>({
  url: '/public/users/password:reset',
  method: 'put',
  requestFn,
  
});

export namespace publicUsersPasswordResetPutApi {
 export interface Req {
  /**
   * 重置token
   */
  token: string;
  /**
   * 密码
   */
  password: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};