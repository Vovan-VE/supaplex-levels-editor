export const gzipCompress = async (input: ArrayBuffer) =>
  await (
    await new Response(
      new Blob([input], { type: "application/octet-stream" })
        .stream()
        .pipeThrough(new CompressionStream("gzip")),
    ).blob()
  ).arrayBuffer();

export const tryGzipCompress = async (input: ArrayBuffer) => {
  try {
    return await gzipCompress(input);
  } catch (e) {
    console.error("Compression failed:", e);
    return null;
  }
};
