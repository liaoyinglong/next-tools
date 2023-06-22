// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询入币详情
 * @tags 入币管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%85%A5%E5%B8%81%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getDetail_5
 */
export const cryptoDepositGetApi = new RequestBuilder<cryptoDepositGetApi.Req, cryptoDepositGetApi.Res>({
  url: '/crypto-deposit',
  method: 'get',
  requestFn,
});

export namespace cryptoDepositGetApi {
 export interface Req {
  orderId: number;
  [k: string]: unknown;
}

 
 /**
 * 入币详情
 */
export interface Res {
  /**
   * 交易源地址
   */
  fromAddress?: string;
  /**
   * 交易目标地址
   */
  toAddress?: string;
  /**
   * 交易目标地址对应的memo
   */
  toMemo?: string;
  /**
   * 错误码（状态为Exceptional时不为空）
   */
  errorCode?: string;
  /**
   * crypto交易手续费
   */
  fees?: {
    /**
     * 手续费类型
     */
    type?: "GAS_FEE" | "TENANT_FEE" | "PLATFORM_FEE";
    /**
     * 手续费对应的资产code
     */
    assetCode?: string;
    /**
     * 手续费对应的资产类型
     */
    assetType?: "FIAT" | "COIN";
    /**
     * 手续费值
     */
    value?: number;
    [k: string]: unknown;
  }[];
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
   * 租户名称
   */
  tenantName?: string;
  /**
   * 订单数量
   */
  quantity?: number;
  /**
   * 交易状态
   */
  status?:
    | "NEW"
    | "PENDING"
    | "COMPLETED"
    | "CANCELLED"
    | "FAILED"
    | "EXCEPTIONAL"
    | "PROCESSING"
    | "PROCESSED"
    | "PENDING_REVIEW"
    | "PENDING_NETWORK";
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