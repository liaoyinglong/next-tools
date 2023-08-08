/**
 * 目前 支持 . 分割的 namespace
 */
export function autoNamespaceByReg(code: string, namespace: string) {
  let hasChanged = false;

  /**
   * replace case:
   * t`login` => t`Merchants.login`
   * t`hello ${name}` => t`Merchants.hello ${name}`
   */
  code = code.replace(/\Wt`(.+?)`/gm, (match, p1) => {
    // 如果 当前 有 $b. 则不替换
    if (/\S\.\S/.test(p1)) {
      return match;
    }
    hasChanged = true;
    return match.replace(p1, `${namespace}.${p1}`);
  });

  /**
   * replace case:
   * t('login') => t('Merchants.login')
   * t("login") => t('Merchants.login')
   */
  code = code.replace(/\Wt\(['"](.+?)['"][),]/gm, (match, p1) => {
    // 如果 当前 有 $b. 则不替换
    if (/\S\.\S/.test(p1)) {
      return match;
    }
    hasChanged = true;
    return match.replace(p1, `${namespace}.${p1}`);
  });

  /**
   * 第二个方法已经满足这种情况了，先注释掉
   * replace case:
   * t('login',{ id:'1' }) => t('Merchants.login',{ id:'1' })
   * t("login",{ id:'1' }) => t('Merchants.login',{ id:'1' })
   */
  // code = code.replace(/\Wt\((["'])(.+?)\1(,|.*\))/gm, (match, p1, p2, p3) => {
  //   // 如果 当前 有 $b. 则不替换
  //   if (/\S\.\S/.test(p2)) {
  //     return match;
  //   }
  //   hasChanged = true;
  //   return `t('${namespace}.${p2}'${p3}`;
  // });

  if (hasChanged) {
    return code;
  }
  return "";
}
