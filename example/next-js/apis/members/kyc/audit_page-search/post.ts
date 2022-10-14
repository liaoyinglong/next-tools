// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询用户kyc审核信息
 * @tags 客户端用户信息相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%AE%A2%E6%88%B7%E7%AB%AF%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearchKycAudit
 */
export const membersKycAuditPageSearchPostApi = new RequestBuilder<membersKycAuditPageSearchPostApi.Req, membersKycAuditPageSearchPostApi.Res>({
  url: '/members/kyc/audit:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace membersKycAuditPageSearchPostApi {
 /**
 * 分页查询统一结构体
 */
export interface Req {
  /**
   * 页码数, 该值的范围是1~1024
   */
  pageNum: number;
  /**
   * 页大小, 该值的范围是1~99999
   */
  pageSize: number;
  /**
   * 是否查询总记录数。查询总记录数会严重影响性能，非必要不查询.
   */
  count: boolean;
  /**
   * kyc审核记录列表查询请求参数
   */
  params: {
    /**
     * 用户id
     */
    userId?: number;
    /**
     * 审核状态
     */
    status?: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
    /**
     * 审核结果
     */
    result?: "PASS" | "REJECT";
    [k: string]: unknown;
  };
  /**
   * 分页查询的排序规则, 最大不能超过10个排序字段
   *
   * @minItems 0
   * @maxItems 10
   */
  orders?: {
    /**
     * 字段名称
     */
    fieldName: string;
    /**
     * 排序规则
     */
    type: "asc" | "desc";
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

 
 /**
 * 分页查询结果统计结构体
 */
export interface Res {
  /**
   * 总记录数。如果请求参数中'是否查询总记录数'为true则此参数将会返回.
   */
  total?: number;
  /**
   * 分页查询的结果
   */
  result: {
    /**
     * id
     */
    id?: number;
    /**
     * 用户id
     */
    userId?: number;
    /**
     * 租户名
     */
    tenantName?: string;
    /**
     * 审核状态
     */
    status?: string;
    /**
     * 审核结果
     */
    result?: string;
    /**
     * 全名
     */
    fullName?: string;
    /**
     * 国籍
     */
    nationality?: string;
    /**
     * 证件类型
     */
    identifyType?: string;
    /**
     * 证件号码
     */
    identityNo?: string;
    /**
     * 生日
     */
    birthDay?: number;
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
     * 审核备注
     */
    remark?: string;
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
  /**
   * 附加值
   */
  extra?: {
    /**
     * 附加值
     */
    [k: string]: {
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}

};