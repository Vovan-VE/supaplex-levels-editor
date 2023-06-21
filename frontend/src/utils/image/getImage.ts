export const getImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error("img error", e);
      reject(new Error("Cannot load image"));
    };
    img.src = url;
  });
