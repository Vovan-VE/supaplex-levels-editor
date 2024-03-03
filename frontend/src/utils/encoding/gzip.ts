const mkPipe =
  (pipeCtor: CompressionStreamConstructor) => async (input: ArrayBuffer) =>
    await (
      await new Response(
        new Blob([input], { type: "application/octet-stream" })
          .stream()
          .pipeThrough(new pipeCtor("gzip")),
      ).blob()
    ).arrayBuffer();

export const gzipCompress = mkPipe(window.CompressionStream);
export const gzipDecompress = mkPipe(window.DecompressionStream);

export const tryGzipCompress = async (input: ArrayBuffer) => {
  try {
    return await gzipCompress(input);
  } catch (e) {
    console.error("Compression failed:", e);
    return null;
  }
};

export const tryGzipDecompress = async (input: ArrayBuffer) => {
  try {
    return await gzipDecompress(input);
  } catch (e) {
    console.error("Decompression failed:", e);
    return null;
  }
};
