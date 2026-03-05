import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { describe, expect, it } from 'vitest';
import { handleIdentifierSnapshot } from './handleIdentifierSnapshot';

export function transform(code: string) {
  const ast = parse(code, {
    plugins: ['typescript', 'jsx'],
  });

  traverse(ast, {
    VariableDeclarator(path) {
      handleIdentifierSnapshot(path);
    },
  });

  let res = generate(ast, {
    retainLines: true,
  });

  return res.code;
}

describe('handleIdentifierSnapshot', () => {
  it('correct', () => {
    const tsx = String.raw;
    const code = tsx`
function App() {
  const a = store.useSnapshot();
  useEffect(() => {
    console.log(a?.b);
  }, [a?.b]);
  function f(a) {
    return (
      <div>
        <span>{a.e}</span>
      </div>
    );
  }
  return (
    <div>
      <span>{a.c}</span>
      <span>{a.c.name}</span>
      <span>{a.c.name}</span>
    </div>
  );
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "function _selector_(a) {return { b: a?.b, c: a.c, "c.name": a.c.name };}
      function App() {
        const a = store.useShallowSnapshot(_selector_);
        useEffect(() => {
          console.log(a.b);
        }, [a.b]);
        function f(a) {
          return (
            <div>
              <span>{a.e}</span>
            </div>);

        }
        return (
          <div>
            <span>{a.c}</span>
            <span>{a["c.name"]}</span>
            <span>{a["c.name"]}</span>
          </div>);

      }"
    `);
  });

  it('should_keep_selector_when_snapshot_has_selector', () => {
    const tsx = String.raw;
    const code = tsx`
function App() {
  const state = store.useSnapshot((s) => {
    return {
      count: s.count,
    };
  });
  return <div>{state.count}</div>;
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function App() {
        const state = store.useShallowSnapshot((s) => {
          return {
            count: s.count
          };
        });
        return <div>{state.count}</div>;
      }"
    `);
  });
  it('raw keep', () => {
    const tsx = String.raw;
    const code = tsx`
function App() {
  const state = store.useSnapshot((s) => {
    return s.user
  });
   const state2 = store.useSnapshot((s) => {
    return s.count
  });
  
  return <div>{state.count}</div>;
}`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function App() {
        const state = store.useSnapshot((s) => {
          return s.user;
        });
        const state2 = store.useSnapshot((s) => {
          return s.count;
        });

        return <div>{state.count}</div>;
      }"
    `);
  });
  it('raw keep2 ', () => {
    const tsx = String.raw;
    const code = tsx`
    function Keep2() {
      const state = store.useSnapshot();
      return <div state={state}>{state.a}</div>;
    }`;
    const expectCode = transform(code);

    expect(expectCode).toMatchInlineSnapshot(`
      "
      function Keep2() {
        const state = store.useSnapshot();
        return <div state={state}>{state.a}</div>;
      }"
    `);
  });
});
