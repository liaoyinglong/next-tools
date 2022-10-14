// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 分页查询入金信息
 * @tags 入金管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%85%A5%E9%87%91%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearch_4
 */
export const faitDepositPageSearchPostApi = new RequestBuilder<faitDepositPageSearchPostApi.Req, faitDepositPageSearchPostApi.Res>({
  url: '/fait-deposit:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace faitDepositPageSearchPostApi {
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
   * 入金查询参数
   */
  params: {
    /**
     * 交易流水号，订单号
     */
    txId?: number;
    /**
     * 支付状态：FAILED-支付失败，SUCCESS-支付成功，PENDING-处理中，CREATE_FAILED-建单失败
     */
    status?: "PENDING" | "FAILED" | "SUCCESS";
    /**
     * 用户的账户Id
     */
    accountId?: number;
    /**
     * 完成开始时间
     */
    updatedTimeStart?: number;
    /**
     * 完成结束时间
     */
    updatedTimeEnd?: number;
    /**
     * 创建开始时间
     */
    createdTimeStart?: number;
    /**
     * 创建结束时间
     */
    createdTimeEnd?: number;
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
     * 交易流水号
     */
    txId?: number;
    /**
     * 用户的账户Id
     */
    accountId?: number;
    /**
     * 支付金额
     */
    amount?: string;
    /**
     * 实际到账
     */
    sendingAmount?: string;
    /**
     * 状态说明
     */
    msg?: string;
    /**
     * 支付网关Id
     */
    gatewayId?: number;
    /**
     * 支付网关名称
     */
    gatewayName?: string;
    /**
     * 支付方式Id
     */
    methodId?: number;
    /**
     * 支付方式名称
     */
    methodName?: string;
    /**
     * VA码
     */
    code?: {
      /**
       * VA码
       */
      code?: string;
      /**
       * VA码过期时间戳
       */
      expire?: number;
      [k: string]: unknown;
    };
    /**
     * 支付状态 FAILED-支付失败，SUCCESS-支付成功，PENDING-处理中，CREATE_FAILED-建单失败
     */
    status?: string;
    /**
     * 手续费列表
     */
    fees?: {
      /**
       * id
       */
      id?: number;
      /**
       * 订单Id，对应于出入金的唯一标识
       */
      orderId?: number;
      /**
       * 订单类型，DEPOSIT-入金；WITHDRAW-出金
       */
      orderType?: string;
      /**
       * 手续费的code
       */
      code?: string;
      /**
       * 手续费的类型
       */
      type?: string;
      /**
       * 是否可见
       */
      visible?: boolean;
      /**
       * 费用的值
       */
      quantity?: string;
      /**
       * 创建时间
       */
      createdTime?: number;
      [k: string]: unknown;
    }[];
    /**
     * 手续费之和
     */
    feeSum?: string;
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