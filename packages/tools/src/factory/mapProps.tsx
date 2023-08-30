import type { ComponentProps, ComponentType, FC } from "react";
import { forwardRef } from "react";

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
export function mapProps<P>(
  BaseComponent: ComponentType<P>,
  mapper: Partial<P>
): FC<P>;
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
