// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 汇率加点设置
 * @tags 汇率管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%B1%87%E7%8E%87%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/update_2
 */
export const exchangeRateBasePointPutApi = new RequestBuilder<exchangeRateBasePointPutApi.Req, exchangeRateBasePointPutApi.Res>({
  url: '/exchange-rate-base-point',
  method: 'put',
  requestFn,
  
});

export namespace exchangeRateBasePointPutApi {
 /**
 * 汇率加点设置
 */
export interface Req {
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
  /**
   * 汇率加点
   */
  basePoint: number;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};