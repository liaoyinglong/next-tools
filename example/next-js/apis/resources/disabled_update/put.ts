// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 禁用或解禁资源
 * @tags 资源(目录、菜单、页面、按钮)相关的接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E8%B5%84%E6%BA%90(%E7%9B%AE%E5%BD%95%E3%80%81%E8%8F%9C%E5%8D%95%E3%80%81%E9%A1%B5%E9%9D%A2%E3%80%81%E6%8C%89%E9%92%AE)%E7%9B%B8%E5%85%B3%E7%9A%84%E6%8E%A5%E5%8F%A3/updateStatus_1
 */
export const resourcesDisabledUpdatePutApi = new RequestBuilder<resourcesDisabledUpdatePutApi.Req, resourcesDisabledUpdatePutApi.Res>({
  url: '/resources/disabled:update',
  method: 'put',
  requestFn,
});

export namespace resourcesDisabledUpdatePutApi {
 /**
 * 更新资源的禁用状态的请求体
 */
export interface Req {
  /**
   * 资源id
   */
  id: number;
  /**
   * 资源的禁用状态: true-禁用; false-正常
   */
  disabled: boolean;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};