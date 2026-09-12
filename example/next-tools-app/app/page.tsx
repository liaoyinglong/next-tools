'use client';

import { RequestBuilder } from '@dune2/tools/rq';
import { createStorage } from '@dune2/tools/storage';
import { createStore } from '@dune2/tools/store';
import { useEffect, type CSSProperties } from 'react';

//#region storage：把计数持久化到 localStorage
class DataMap {
  count = 0;
}

const storage = createStorage({ DataMap, namespace: 'dune2-demo' });
//#endregion

//#region store：动作里顺手写回 storage，状态与持久化保持一致
const counterStore = createStore({
  name: 'counter',
  state: { count: 0 },
  actionsCreator: (state) => ({
    hydrate: (count: number) => {
      state.count = count;
    },
    increment: () => {
      state.count += 1;
      storage.count.set(state.count);
    },
    decrement: () => {
      state.count -= 1;
      storage.count.set(state.count);
    },
    reset: () => {
      state.count = 0;
      storage.count.set(0);
    },
  }),
});
//#endregion

//#region rq：同一个 RequestBuilder 上既有 query 也有 mutation
const pingApi = new RequestBuilder<undefined, { message: string; at: string }>({
  url: '/api/ping',
  method: 'get',
});

const reportApi = new RequestBuilder<
  { count: number },
  { received: number; at: string }
>({
  url: '/api/ping',
  method: 'post',
});
//#endregion

export default function Home() {
  const { count } = counterStore.useSnapshot();
  const persisted = storage.count.useValue();
  const ping = pingApi.useQuery();
  const report = reportApi.useMutation();

  // localStorage 只有浏览器里有，挂载后再恢复，避免 SSR 与水合结果不一致
  useEffect(() => {
    counterStore.actions.hydrate(Number(storage.count.get()) || 0);
  }, []);

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: 20 }}>@dune2/tools 示例</h1>
      <p style={mutedStyle}>
        这个页面同时用到 <code>@dune2/tools/store</code>、
        <code>@dune2/tools/storage</code> 和 <code>@dune2/tools/rq</code>。
      </p>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>store + storage</h2>
        <p>
          计数：<strong data-testid='count'>{count}</strong>（localStorage 里是{' '}
          {String(persisted)}）
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            data-testid='increment'
            onClick={() => counterStore.actions.increment()}
          >
            +1
          </button>
          <button onClick={() => counterStore.actions.decrement()}>-1</button>
          <button onClick={() => counterStore.actions.reset()}>重置</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>rq query</h2>
        <p data-testid='ping'>
          {ping.isPending
            ? '请求中…'
            : ping.isError
              ? `失败：${(ping.error as Error).message}`
              : `${ping.data?.message} @ ${ping.data?.at}`}
        </p>
        <button onClick={() => ping.refetch()}>重新请求</button>
      </section>

      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>rq mutation</h2>
        <p data-testid='report'>
          {report.isPending
            ? '提交中…'
            : report.isError
              ? `失败：${(report.error as Error).message}`
              : report.data
                ? `服务端收到 ${report.data.received}`
                : '还没上报过'}
        </p>
        <button onClick={() => report.mutate({ count })}>上报当前计数</button>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  margin: '0 auto',
  maxWidth: 640,
  padding: 24,
};

const mutedStyle: CSSProperties = {
  color: '#666',
  fontSize: 14,
};

const cardStyle: CSSProperties = {
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  marginTop: 16,
  padding: 16,
};

const cardTitleStyle: CSSProperties = {
  fontSize: 16,
  margin: '0 0 8px',
};
