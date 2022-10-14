// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询出金详情
 * @tags 出金管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%87%BA%E9%87%91%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getDetail_3
 */
export const faitWithdrawalGetApi = new RequestBuilder<faitWithdrawalGetApi.Req, faitWithdrawalGetApi.Res>({
  url: '/fait-withdrawal',
  method: 'get',
  requestFn,
  
  
});

export namespace faitWithdrawalGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 出金信息
 */
export interface Res {
  /**
   * id
   */
  id?: number;
  /**
   * txId
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
   * 收款银行编码
   */
  bankCode?: number;
  /**
   * 收款银行名称
   */
  bankName?: string;
  /**
   * 收款卡号(脱敏后)
   */
  accountNo?: string;
  /**
   * 收款人姓名(脱敏后)
   */
  accountName?: string;
  /**
   * 打款状态 FAILED 支付失败，SUCCESS 支付成功，PENDING-处理中，CREATE_FAILED-建单失败
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
}

};