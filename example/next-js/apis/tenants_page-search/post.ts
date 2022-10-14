// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 分页查询租户
 * @tags 租户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%A7%9F%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/search
 */
export const tenantsPageSearchPostApi = new RequestBuilder<tenantsPageSearchPostApi.Req, tenantsPageSearchPostApi.Res>({
  url: '/tenants:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace tenantsPageSearchPostApi {
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
   * 查询的条件参数. 如果你的查询没有任何条件, 请传入一个空的对象(非null)
   */
  params: {
    tenantId?: number;
    name?: string;
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
     * id
     */
    id?: number;
    /**
     * 租户名称
     */
    name?: string;
    /**
     * 头像地址
     */
    avatar?: string;
    /**
     * 租户的状态
     */
    status?: "NEW" | "ACTIVE" | "INACTIVE";
    /**
     * 信任等级
     */
    trustLevel?: "LEVEL0" | "LEVEL1" | "LEVEL2";
    /**
     * secret限制的数量
     */
    keyLimit?: number;
    /**
     * 创建时间
     */
    createdTime?: string;
    /**
     * 最后修改时间
     */
    updatedTime?: string;
    /**
     * 企业简称
     */
    shortName?: string;
    /**
     * 申请开通的账号
     */
    account?: string;
    /**
     * 生效时间
     */
    effectedTime?: string;
    /**
     * 失效时间
     */
    expiredTime?: string;
    /**
     * 联系方式
     */
    contact?: string;
    /**
     * 租户编码
     */
    code?: string;
    /**
     * 企业logo
     */
    logo?: string;
    /**
     * 企业宣传图
     */
    advertisement?: string;
    /**
     * 营业执照
     */
    businessLicense?: string[];
    /**
     * 备注
     */
    remark?: string;
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