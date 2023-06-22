// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询用户kyc信息
 * @tags 客户端用户信息相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getUserInfo
 */
export const membersKycGetApi = new RequestBuilder<membersKycGetApi.Req, membersKycGetApi.Res>({
  url: '/members/kyc',
  method: 'get',
  requestFn,
});

export namespace membersKycGetApi {
 export interface Req {
  tenantId: number;
  accountId: number;
  [k: string]: unknown;
}

 
 /**
 * 用户kyc信息
 */
export interface Res {
  /**
   * 用户基础信息
   */
  baseInfo?: {
    /**
     * 用户id
     */
    userId?: number;
    /**
     * 用户类型
     */
    userType?: string;
    /**
     * 租户名
     */
    tenantName?: string;
    /**
     * 用户状态
     */
    userStatus?: string;
    /**
     * 手机号
     */
    phoneNumber?: string;
    /**
     * 邮箱
     */
    email?: string;
    /**
     * 交易路由
     */
    tradeRoute?: string;
    [k: string]: unknown;
  };
  /**
   * 用户kyc信息
   */
  kyc?: {
    /**
     * KYC的用户id
     */
    userId?: number;
    /**
     * 全名
     */
    fullName?: string;
    /**
     * 国籍
     */
    nationality?: string;
    /**
     * 生日
     */
    birthDay?: number;
    /**
     * 证件类型
     */
    identifyType?: string;
    /**
     * 证件号码
     */
    identityNo?: string;
    /**
     * 证件照
     */
    frontsideUrl?: string;
    /**
     * 自拍照地址
     */
    selfieUrl?: string;
    /**
     * 活体检测照
     */
    facialRecognitionUrl?: string[];
    /**
     * 居住地的国家
     */
    residentialCountry?: string;
    /**
     * 居住城市
     */
    residentialCity?: string;
    /**
     * 居住详细地址
     */
    residentialAddress?: string;
    /**
     * 邮编
     */
    postCode?: string;
    /**
     * level1通过时间
     */
    createdTime?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

};