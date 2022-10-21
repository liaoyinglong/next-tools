// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询可换汇列表
 * @tags 汇率管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%B1%87%E7%8E%87%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getExchangeRateSelect
 */
export const exchangeRatesGetApi = new RequestBuilder<exchangeRatesGetApi.Req, exchangeRatesGetApi.Res>({
  url: '/exchange-rates',
  method: 'get',
  requestFn,
});

export namespace exchangeRatesGetApi {
 export type Req = any;
 
 /**
 * 请求返回的结果
 */
export type Res = {
  /**
   * 基准类型 assetId
   */
  baseAssetId?: number;
  /**
   * 基准Asset
   */
  baseAsset?: string;
  /**
   * 基准类型
   */
  baseAssetType?: "FIAT" | "COIN";
  /**
   * 兑换 assetId
   */
  counterAssetId?: number;
  /**
   * 兑换 Asset
   */
  counterAsset?: string;
  /**
   * 兑换类型
   */
  counterAssetType?: "FIAT" | "COIN";
  [k: string]: unknown;
}[];

};