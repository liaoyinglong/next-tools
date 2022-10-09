// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询所有币种的指数价格
 * @tags 价格相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E4%BB%B7%E6%A0%BC%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getIndexPrice
 */
export const indexPriceGetApi = new RequestBuilder<indexPriceGetApi.Req, indexPriceGetApi.Res>({
  url: '/index-price',
  method: 'get',
  requestFn,
  
});

export namespace indexPriceGetApi {
 export type Req = any;
 
 /**
 * 请求返回的结果
 */
export type Res = {
  symbolId?: number;
  base?: string;
  counter?: string;
  latestPrice?: number;
  [k: string]: unknown;
}[];

};