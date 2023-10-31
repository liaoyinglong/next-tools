import type { ComponentType, FC, PropsWithChildren } from 'react';
import React, { useContext } from 'react';

interface Params<T> {
  /**
   * 传入一个hooks 返回值会给 context 的 value
   */
  useValueHooks: () => T;
  defaultValue?: T;
}

/**
 * 快速创建一个 context 和 Provider
 * 通过给定的 hooks 返回值创建 context 的 value
 */
export function createStateContext<T>(params: Params<T>) {
  const { useValueHooks, defaultValue } = params;
  const Context = React.createContext(defaultValue as T);

  const Provider: FC<PropsWithChildren> = (props) => {
    const value = useValueHooks();
    return <Context.Provider value={value}>{props.children}</Context.Provider>;
  };

  function useContextValue() {
    return useContext(Context)!;
  }

  function withProvider<P extends object>(Comp: ComponentType<P>) {
    return WithProvider;

    function WithProvider(props: P) {
      return (
        <Provider>
          <Comp {...props}></Comp>
        </Provider>
      );
    }
  }

  return {
    useContextValue,
    Provider,
    withProvider,
    Context,
  };
}
