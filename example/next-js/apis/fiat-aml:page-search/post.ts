// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * Fiat 黑名单查询
 * @tags 黑名单管理控制
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E9%BB%91%E5%90%8D%E5%8D%95%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6/pageSearchFiat
 */
export const fiatAmlPageSearchPostApi = new RequestBuilder<fiatAmlPageSearchPostApi.Req, fiatAmlPageSearchPostApi.Res>({
  url: '/fiat-aml:page-search',
  method: 'post',
  requestFn,
  
});

export namespace fiatAmlPageSearchPostApi {
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
   * Fiat 请求参数
   */
  params: {
    /**
     * 名单类型 ENTITY/INDIVIDUAL
     */
    type: "ENTITY" | "INDIVIDUAL" | "UNRECOGNIZED";
    /**
     * 名称
     */
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
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};