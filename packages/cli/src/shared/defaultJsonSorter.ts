import _ from "lodash";

/**
 * 对 JSON 对象的键进行排序
 * @param obj 要排序的 JSON 对象
 * @returns 排序后的 JSON 对象
 */
export function defaultJsonSorter<T extends Record<string, any>>(obj: T) {
  const keys = Object.keys(obj);
  const sortedKeys = _.sortBy(keys); // 使用 lodash 库的 sortBy 方法对键进行排序
  const sortedObj = sortedKeys.reduce((acc, key) => {
    acc[key as keyof T] = obj[key];
    return acc;
  }, {} as T);

  return sortedObj as T;
}
