import { createRuleTransform, type TransformRule } from './shared';

const CLIENT_ONLY_ERROR =
  'createClientOnlyFn() functions can only be called on the client!';

const rules: TransformRule[] = [
  {
    pattern: 'createClientOnlyFn($F)',
    replace: (m, { consumer }) =>
      consumer === 'client'
        ? m.getMatch('F')!.text()
        : `() => { throw new Error("${CLIENT_ONLY_ERROR}"); }`,
  },
];

export const createClientOnlyFnTransform = createRuleTransform(rules);
