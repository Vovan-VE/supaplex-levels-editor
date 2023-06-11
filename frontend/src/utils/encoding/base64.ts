export const base64Encode = (ab: ArrayBufferLike) => {
  // return window.btoa(String.fromCharCode(...new Uint8Array(ab)));
  //
  // libwebkitgtk 2.38 (Ubuntu 22.04):
  //
  //     > String.fromCharCode(...new Uint8Array(0x10000)).length
  //     < 65536
  //     > String.fromCharCode(...new Uint8Array(0x10001)).length
  //     < RangeError: Maximum call stack size exceeded.

  let bin = "";
  const chunk = 32768;
  for (let i = 0, to = chunk; i < ab.byteLength; i = to, to += chunk) {
    bin += String.fromCharCode(
      ...new Uint8Array(ab.slice(i, to <= ab.byteLength ? to : ab.byteLength)),
    );
  }
  const b64 = window.btoa(bin);

  // trim "=" in the end
  let to = b64.length;
  while (to > 0 && b64.charAt(to - 1) === "=") {
    to--;
  }
  if (to < b64.length) {
    return b64.substring(0, to);
  }
  return b64;
};

export const base64Decode = (blob64: string): ArrayBufferLike => {
  const b = window.atob(blob64);
  return Uint8Array.from({ length: b.length }, (_, i) => b.charCodeAt(i))
    .buffer;
};
