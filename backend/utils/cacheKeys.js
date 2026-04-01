export const cacheKeys = {
  authMe: (uid) => `auth:me:${uid}`,
  feed: (uid, page, limit) => `feed:${uid}:page:${page}:limit:${limit}`,
};
