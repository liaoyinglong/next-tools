// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 重新激活
 * @tags 后台用户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E5%8F%B0%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/userActive
 */
export const publicUsersActivePutApi = new RequestBuilder<publicUsersActivePutApi.Req, publicUsersActivePutApi.Res>({
  url: '/public/users:active',
  method: 'put',
  requestFn,
});

export namespace publicUsersActivePutApi {
 export interface Req {
  /**
   * 重置token
   */
  token: string;
  /**
   * 密码
   */
  password: string;
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