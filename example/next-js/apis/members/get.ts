// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 模糊查询用户,最多10条记录
 * @tags 客户端用户信息相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getMember
 */
export const membersGetApi = new RequestBuilder<membersGetApi.Req, membersGetApi.Res>({
  url: '/members',
  method: 'get',
  requestFn,
  
  
});

export namespace membersGetApi {
 export interface Req {
  tenantId?: number;
  target: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = {
  /**
   * 用户id
   */
  userId?: number;
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 账户id
   */
  accountId?: number;
  /**
   * 租户名
   */
  tenantName?: string;
  /**
   * 手机区号
   */
  areaCode?: string;
  /**
   * 手机号：区号+手机号
   */
  phoneNumber?: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 全名
   */
  fullName?: string;
  [k: string]: unknown;
}[];

};