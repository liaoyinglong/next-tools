// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 创建币种
 * @tags 币种管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%B8%81%E7%A7%8D%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/create_3
 */
export const coinsPostApi = new RequestBuilder<coinsPostApi.Req, coinsPostApi.Res>({
  url: '/coins',
  method: 'post',
  requestFn,
  
});

export namespace coinsPostApi {
 /**
 * 创建币种请求参数
 */
export interface Req {
  /**
   * 创建币种对象
   */
  coin?: {
    /**
     * crypto来源Id，crypto_datasource表的Id
     */
    sourceId: number;
    /**
     * 资产显示精度
     */
    decimals: number;
    /**
     * 币种icon
     */
    iconUrl: string;
    /**
     * 支持充值
     */
    canDeposit: boolean;
    /**
     * 支持体现
     */
    canWithdraw: boolean;
    /**
     * 备注
     */
    remarks?: string;
    [k: string]: unknown;
  };
  /**
   * 区块链网络列表
   *
   * @minItems 0
   * @maxItems 20
   */
  networks?: {
    /**
     * 网络类型Id
     */
    networkTypeId: number;
    /**
     * 协议类型Id
     */
    protocolTypeId?: number;
    /**
     * 是否支持充币或者提币标签备注 1、支持 2、不支持
     */
    canMemo: boolean;
    /**
     * 支持充值
     */
    canDeposit: boolean;
    /**
     * 支持提现
     */
    canWithdraw: boolean;
    /**
     * Crypto中台收取的提币或者充币手续费用
     */
    withdrawFees: string;
    /**
     * 最小提币数量
     */
    minWithdrawAmount: string;
    /**
     * 资产Id
     */
    assetId: string;
    /**
     * 网络状态(NEW,ACTIVE,INACTIVE)
     */
    status: "NEW" | "ACTIVE" | "INACTIVE";
    /**
     * 备注
     */
    remarks?: string;
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