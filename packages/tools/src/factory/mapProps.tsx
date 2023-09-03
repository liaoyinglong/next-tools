import type { ComponentProps, ComponentType, FC, JSX } from "react";
import { forwardRef } from "react";
import { OptionalKeys } from "../shared/OptionalKeys";

/**
 * ```js
 * mapProps('div', { className: "newClassName" });
 * ```
 */
export function mapProps<C extends keyof JSX.IntrinsicElements>(
  BaseComponent: C,
  mapper: JSX.IntrinsicElements[C]
): FC<JSX.IntrinsicElements[C]>;
/**
 * ```js
 * mapProps('div', p => ({ ...p, className: "newClassName" }));
 * ```
 */
export function mapProps<
  C extends keyof JSX.IntrinsicElements,
  P extends JSX.IntrinsicElements[C]
>(BaseComponent: C, mapper: (p: P) => P): FC<P>;
/**
 * ```js
 * mapProps(Card, { className: "newClassName" });
 * ```
 */
export function mapProps<
  RawP extends object,
  ExtP extends Partial<RawP> = Partial<RawP>
>(BaseComponent: ComponentType<RawP>, mapper: ExtP): Comp<RawP, ExtP>;
/**
 * ```js
 * mapProps(Card, p => ({ ...p, className: "newClassName" }));
 * ```
 */
export function mapProps<
  C extends ComponentType<any>,
  P extends ComponentProps<C>
>(BaseComponent: C, mapper: (p: P) => P): FC<P>;
/**
 * 给组件添加默认props 或者 重写props
 */
export function mapProps<C, P extends Record<any, any>>(
  BaseComponent: any,
  mapper: P | ((p: P) => P)
) {
  const MappedComponent = (props: P, ref: any) => {
    let newProps =
      typeof mapper === "function"
        ? mapper(props)
        : {
            ...mapper,
            ...props,
          };

    return <BaseComponent {...newProps} ref={ref}></BaseComponent>;
  };
  if (process.env.NODE_ENV !== "production") {
    MappedComponent.displayName = `mapProps(${getDisplayName(BaseComponent)})`;
  }

  return forwardRef<any, P>(MappedComponent);
}
function getDisplayName(Component: ComponentType<any>): string {
  return typeof Component === "string"
    ? Component
    : Component.displayName || Component.name || "Unknown";
}

// type helper

type CombinedProps<
  A extends object,
  B extends object,
  Keys extends keyof A = OptionalKeys<A, B>
> = Omit<A, Keys> & {
  [K in Keys]?: A[K];
};

type Comp<A extends object, B extends object> = FC<CombinedProps<A, B>>;
