// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 创建后台用户
 * @tags 后台用户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E5%8F%B0%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/createUser
 */
export const usersPostApi = new RequestBuilder<usersPostApi.Req, usersPostApi.Res>({
  url: '/users',
  method: 'post',
  requestFn,
  
  
});

export namespace usersPostApi {
 /**
 * 创建用户请求参数
 */
export interface Req {
  email: string;
  /**
   * 姓名
   */
  realName: string;
  /**
   * 手机区号
   */
  areaCode?: string;
  /**
   * 手机号
   */
  phoneNumber?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 角色列表
   */
  roleIds: number[];
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};