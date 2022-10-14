// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 更新角色状态
 * @tags 角色相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E8%A7%92%E8%89%B2%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/updateStatus
 */
export const rolesDisabledUpdatePutApi = new RequestBuilder<rolesDisabledUpdatePutApi.Req, rolesDisabledUpdatePutApi.Res>({
  url: '/roles/disabled:update',
  method: 'put',
  requestFn,
  
  
});

export namespace rolesDisabledUpdatePutApi {
 /**
 * 更新角色状态的请求体
 */
export interface Req {
  /**
   * 角色id
   */
  id: number;
  /**
   * 角色的状态: true-禁用; false-正常
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