// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 更新租户
 * @tags 租户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%A7%9F%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/update
 */
export const tenantsPutApi = new RequestBuilder<tenantsPutApi.Req, tenantsPutApi.Res>({
  url: '/tenants',
  method: 'put',
  requestFn,
  
});

export namespace tenantsPutApi {
 /**
 * 更新租户信息请求参数
 */
export interface Req {
  /**
   * 记录id
   */
  id: number;
  /**
   * 企业简称
   */
  shortName?: string;
  /**
   * 申请开通的账号
   */
  account: string;
  /**
   * 生效时间
   */
  effectedTime: string;
  /**
   * 失效时间
   */
  expiredTime: string;
  /**
   * 联系方式
   */
  contact?: string;
  /**
   * 企业logo
   */
  logo?: string;
  /**
   * 企业宣传图
   */
  advertisement?: string;
  /**
   * 信任等级
   */
  trustLevel: "LEVEL1" | "LEVEL2";
  /**
   * 营业执照
   *
   * @minItems 1
   * @maxItems 5
   */
  businessLicense: string[];
  /**
   * 状态
   */
  status?: "ACTIVE" | "INACTIVE";
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