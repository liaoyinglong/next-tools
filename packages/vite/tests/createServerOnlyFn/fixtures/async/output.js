import { createServerOnlyFn } from 'stub';

export const readUser = async (id) => {
  const row = await db.user.findById(id);
  return row;
};
