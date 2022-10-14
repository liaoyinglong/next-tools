// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 单笔查询入币信息
 * @tags 入币管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%85%A5%E5%B8%81%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/singleSearch
 */
export const cryptoDepositSingleSearchPostApi = new RequestBuilder<cryptoDepositSingleSearchPostApi.Req, cryptoDepositSingleSearchPostApi.Res>({
  url: '/crypto-deposit:single-search',
  method: 'post',
  requestFn,
  
  
});

export namespace cryptoDepositSingleSearchPostApi {
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
   * 入币单笔查询参数
   */
  params: {
    /**
     * 订单id
     */
    txId: number;
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
  /**
   * 订单id
   */
  orderId?: number;
  /**
   * 交易完成后产生的交易hash
   */
  txHash?: string;
  /**
   * 币种代码
   */
  coinCode?: string;
  /**
   * 网络名称
   */
  networkName?: string;
  /**
   * 交易对应的account id
   */
  accountId?: number;
  /**
   * 租户id
   */
  tenantId?: number;
  /**
   * 订单数量
   */
  quantity?: number;
  /**
   * 交易状态
   */
  status?: "NEW" | "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED" | "EXCEPTIONAL" | "PROCESSING" | "PROCESSED";
  /**
   * 到达时间
   */
  arriveTime?: string;
  /**
   * 数据更新时间
   */
  updatedTime?: string;
  [k: string]: unknown;
}

};