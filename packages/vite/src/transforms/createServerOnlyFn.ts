import { createRuleTransform, type TransformRule } from './shared';

const SERVER_ONLY_ERROR =
  'createServerOnlyFn() functions can only be called on the server!';

const rules: TransformRule[] = [
  {
    pattern: 'createServerOnlyFn($F)',
    replace: (m, { consumer }) =>
      consumer === 'server'
        ? m.getMatch('F')!.text()
        : `() => { throw new Error("${SERVER_ONLY_ERROR}"); }`,
  },
];

export const createServerOnlyFnTransform = createRuleTransform(rules);
