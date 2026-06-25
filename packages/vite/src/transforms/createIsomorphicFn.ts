import { createRuleTransform, type TransformRule } from './shared';

/**
 * Environment-target transform for `createIsomorphicFn().server(s).client(c)`.
 *
 * Replaces the chain with the selected consumer branch, or `() => {}` when
 * the selected branch is missing. Longer patterns are tried first; any match
 * nested inside an already-replaced range is skipped.
 */
const rules: TransformRule[] = [
  {
    pattern: 'createIsomorphicFn().server($S).client($C)',
    replace: (m, { consumer }) =>
      consumer === 'server' ? m.getMatch('S')!.text() : m.getMatch('C')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().client($C).server($S)',
    replace: (m, { consumer }) =>
      consumer === 'server' ? m.getMatch('S')!.text() : m.getMatch('C')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().server($S)',
    replace: (m, { consumer }) =>
      consumer === 'server' ? m.getMatch('S')!.text() : '() => {}',
  },
  {
    pattern: 'createIsomorphicFn().client($C)',
    replace: (m, { consumer }) =>
      consumer === 'client' ? m.getMatch('C')!.text() : '() => {}',
  },
  {
    pattern: 'createIsomorphicFn()',
    replace: () => '() => {}',
  },
];

export const createIsomorphicFnTransform = createRuleTransform(rules);
