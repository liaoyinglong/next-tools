import { createServerOnlyFn } from 'stub';

function myFn(x) {
  return x * 2;
}

const wrapped = myFn;
