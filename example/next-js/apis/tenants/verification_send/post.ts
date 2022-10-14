// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 发送重置链接
 * @tags 租户管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%A7%9F%E6%88%B7%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/verification_1
 */
export const tenantsVerificationSendPostApi = new RequestBuilder<tenantsVerificationSendPostApi.Req, tenantsVerificationSendPostApi.Res>({
  url: '/tenants/verification:send',
  method: 'post',
  requestFn,
  
  
});

export namespace tenantsVerificationSendPostApi {
 export interface Req {
  /**
   * 租户id
   */
  id: number;
  /**
   * 重置类型(PASSWORD, VERIFY, ACTIVE)
   */
  resetType: "PASSWORD" | "VERIFY" | "ACTIVE";
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};