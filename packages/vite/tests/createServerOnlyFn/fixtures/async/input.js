import { createServerOnlyFn } from 'stub';

export const readUser = createServerOnlyFn(async (id) => {
  const row = await db.user.findById(id);
  return row;
});
