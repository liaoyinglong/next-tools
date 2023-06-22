// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询单个后台用户信息
 * @tags 后台用户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E5%8F%B0%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/queryUserById
 */
export const usersGetApi = new RequestBuilder<usersGetApi.Req, usersGetApi.Res>({
  url: '/users',
  method: 'get',
  requestFn,
});

export namespace usersGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 查询用户响应结果
 */
export interface Res {
  /**
   * 用户id
   */
  id?: number;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 姓名
   */
  realName?: string;
  /**
   * 用户状态(ACTIVE, INACTIVE)
   */
  status?: "NEW" | "ACTIVE" | "INACTIVE";
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
   * 更新用户id
   */
  updatedBy?: number;
  /**
   * 更新的用户名
   */
  updatedRealName?: string;
  /**
   * 更新时间
   */
  updatedTime?: string;
  /**
   * 用户角色
   */
  roles?: {
    userId?: number;
    roleId?: number;
    roleName?: string;
    disabled?: boolean;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

};