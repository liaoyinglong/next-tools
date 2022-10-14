// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 分页查询换汇记录
 * @tags 汇率管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%B1%87%E7%8E%87%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearch_2
 */
export const prefundingOrderPageSearchPostApi = new RequestBuilder<prefundingOrderPageSearchPostApi.Req, prefundingOrderPageSearchPostApi.Res>({
  url: '/prefunding-order:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace prefundingOrderPageSearchPostApi {
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
   * 查询请求参数
   */
  params: {
    /**
     * 基础货币ID
     */
    baseAssetId: number;
    /**
     * 基础货币类型
     */
    baseAssetType: "FIAT" | "COIN";
    /**
     * 计价货币ID
     */
    counterAssetId: number;
    /**
     * 计价货币类型
     */
    counterAssetType: "FIAT" | "COIN";
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
     * 表Id
     */
    id?: number;
    /**
     * 基准类型 assetId
     */
    baseAssetId?: number;
    /**
     * 基准类型
     */
    baseAssetType?: string;
    /**
     * 兑换 assetId
     */
    counterAssetId?: number;
    /**
     * 兑换类型
     */
    counterAssetType?: string;
    /**
     * 基准coin的数量
     */
    baseQty?: string;
    /**
     * 兑换coin的数量
     */
    counterQty?: string;
    /**
     * 中间兑换USD的数量
     */
    usdQty?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 汇率状态
     */
    status?: string;
    /**
     * 创建人id
     */
    createdBy?: number;
    /**
     * 更新人id
     */
    updatedBy?: number;
    /**
     * 更新人名称
     */
    updatedRealName?: string;
    /**
     * 创建时间
     */
    createdTime?: number;
    /**
     * 更新时间
     */
    updatedTime?: number;
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