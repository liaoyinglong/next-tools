import { createClientOnlyFn } from 'stub';

export const onlyClient = createClientOnlyFn(function readDom() {
  return document.title;
});
