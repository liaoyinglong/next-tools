// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 根据资产名称或code获取指定资产的详细情况
 * @tags 币种管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%B8%81%E7%A7%8D%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getAsset
 */
export const coinsAssetsGetApi = new RequestBuilder<coinsAssetsGetApi.Req, coinsAssetsGetApi.Res>({
  url: '/coins/assets',
  method: 'get',
  requestFn,
});

export namespace coinsAssetsGetApi {
 export interface Req {
  assetId: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = string[];

};