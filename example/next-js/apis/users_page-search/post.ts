// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 分页查询后台用户信息
 * @tags 后台用户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E5%8F%B0%E7%94%A8%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearchSysUsers
 */
export const usersPageSearchPostApi = new RequestBuilder<usersPageSearchPostApi.Req, usersPageSearchPostApi.Res>({
  url: '/users:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace usersPageSearchPostApi {
 /**
 * 分页查询统一结构体
 */
export interface Req {
  /**
   * 页码数, 该值的范围是1~1024
   */
  pageNum: number;
  /**
   * 页大小, 该值的范围是1~99999
   */
  pageSize: number;
  /**
   * 是否查询总记录数。查询总记录数会严重影响性能，非必要不查询.
   */
  count: boolean;
  /**
   * 查询用户请求参数
   */
  params: {
    /**
     * 用户名/邮箱
     */
    realNameOrEmail?: string;
    /**
     * 状态(ACTIVE, INACTIVE)
     */
    status?: "NEW" | "ACTIVE" | "INACTIVE";
    [k: string]: unknown;
  };
  /**
   * 分页查询的排序规则, 最大不能超过10个排序字段
   *
   * @minItems 0
   * @maxItems 10
   */
  orders?: {
    /**
     * 字段名称
     */
    fieldName: string;
    /**
     * 排序规则
     */
    type: "asc" | "desc";
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

 
 /**
 * 分页查询结果统计结构体
 */
export interface Res {
  /**
   * 总记录数。如果请求参数中'是否查询总记录数'为true则此参数将会返回.
   */
  total?: number;
  /**
   * 分页查询的结果
   */
  result: {
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
  }[];
  /**
   * 附加值
   */
  extra?: {
    /**
     * 附加值
     */
    [k: string]: {
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}

};