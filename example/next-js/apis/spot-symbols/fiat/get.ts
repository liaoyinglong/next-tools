// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询法币列表
 * @tags 交易对相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E4%BA%A4%E6%98%93%E5%AF%B9%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/searchFiat
 */
export const spotSymbolsFiatGetApi = new RequestBuilder<spotSymbolsFiatGetApi.Req, spotSymbolsFiatGetApi.Res>({
  url: '/spot-symbols/fiat',
  method: 'get',
  requestFn,
  
  
});

export namespace spotSymbolsFiatGetApi {
 export interface Req {
  code?: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = {
  /**
   * 表id
   */
  id?: number;
  /**
   * 币种英文名称
   */
  name?: string;
  /**
   * 币种代码
   */
  code?: string;
  /**
   * Icon图片资源地址。SVG格式，可适应大小
   */
  iconUrl?: string;
  /**
   * 货币发行地区的country code
   */
  regionCode?: string;
  /**
   * 状态
   */
  status?: string;
  /**
   * 是否可入金
   */
  canDeposit?: boolean;
  /**
   * 是否可出金
   */
  canWithdraw?: boolean;
  /**
   * Crypto中台向租户收取的入金手续费
   */
  depositFees?: string;
  /**
   * Crypto中台向租户收取的出金手续费
   */
  withdrawFees?: string;
  /**
   * 最小出金数量
   */
  minWithdrawAmount?: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 创建人
   */
  createdRealName?: string;
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

};