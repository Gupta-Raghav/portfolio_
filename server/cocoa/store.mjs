import { get, put, BlobPreconditionFailedError, BlobNotFoundError } from '@vercel/blob';

export const MAX_DOCUMENT_BYTES = 1024 * 1024;
export class StorageConflict extends Error {}
export function createPrivateStore(env = process.env) {
  const tokens = {
    raghav: env.COCOA_RAGHAV_READ_WRITE_TOKEN || env.COCOA_BLOB_TOKEN_RAGHAV,
    guest: env.COCOA_ANANYA_READ_WRITE_TOKEN || env.COCOA_BLOB_TOKEN_ANANYA
  };
  const ready = !!tokens.raghav && !!tokens.guest && tokens.raghav !== tokens.guest;
  function location(user) {
    if (!ready || !Object.hasOwn(tokens, user.profile) || !/^[a-f0-9]{64}$/.test(user.id)) throw new Error('Storage configuration unavailable');
    // Neither token nor pathname ever comes from the HTTP request or document body.
    return { token: tokens[user.profile], pathname: `cocoa/${user.id}/workspace.json` };
  }
  async function read(user) {
    const { token, pathname } = location(user);
    let result;
    try { result = await get(pathname, { token, access: 'private', useCache: false }); }
    catch (error) { if (error instanceof BlobNotFoundError) return null; throw error; }
    if (!result) return null;
    if (result.statusCode !== 200 || result.blob.size > MAX_DOCUMENT_BYTES) throw new Error('Invalid stored document');
    const raw = await new Response(result.stream).text();
    if (Buffer.byteLength(raw) > MAX_DOCUMENT_BYTES) throw new Error('Invalid stored document');
    return { data: JSON.parse(raw), etag: result.blob.etag };
  }
  async function write(user, data, expectedEtag) {
    const { token, pathname } = location(user);
    const body = JSON.stringify(data);
    if (Buffer.byteLength(body) > MAX_DOCUMENT_BYTES) throw new Error('Document too large');
    const current = await read(user);
    if ((current?.etag || null) !== expectedEtag) throw new StorageConflict();
    try {
      const result = await put(pathname, body, {
        token, access: 'private', contentType: 'application/json', addRandomSuffix: false,
        cacheControlMaxAge: 60, allowOverwrite: expectedEtag !== null,
        ...(expectedEtag ? { ifMatch: expectedEtag } : {})
      });
      return result.etag;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) throw new StorageConflict();
      // A competing first write must never overwrite the document just created.
      if (expectedEtag === null && await read(user)) throw new StorageConflict();
      throw error;
    }
  }
  return { ready, read, write };
}
