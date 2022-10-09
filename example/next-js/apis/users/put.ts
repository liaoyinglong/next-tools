// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 更新用户信息
 * @tags 后台用户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E5%8F%B0%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/updateUser
 */
export const usersPutApi = new RequestBuilder<usersPutApi.Req, usersPutApi.Res>({
  url: '/users',
  method: 'put',
  requestFn,
  
});

export namespace usersPutApi {
 /**
 * 更新后台用户请求参数
 */
export interface Req {
  /**
   * 用户id
   */
  id: number;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 姓名
   */
  realName?: string;
  /**
   * 手机区号
   */
  areaCode?: string;
  /**
   * 手机号
   */
  phoneNumber?: string;
  /**
   * 状态
   */
  status?: "NEW" | "ACTIVE" | "INACTIVE";
  /**
   * 备注
   */
  remark?: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};