// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询用户所有账户信息
 * @tags 客户端用户信息相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getUserAccounts
 */
export const membersAccountsGetApi = new RequestBuilder<membersAccountsGetApi.Req, membersAccountsGetApi.Res>({
  url: '/members/accounts',
  method: 'get',
  requestFn,
  
  
});

export namespace membersAccountsGetApi {
 export interface Req {
  userId: number;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = {
  id?: number;
  tenantId?: number;
  userId?: number;
  main?: boolean;
  email?: string;
  regionCode?: string;
  phoneNumber?: string;
  password?: string;
  status?: "NEW" | "ACTIVE" | "INACTIVE" | "FROZEN";
  [k: string]: unknown;
}[];

};