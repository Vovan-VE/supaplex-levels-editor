export const setTitle = (title: string) => {
  try {
    window.document.title = title;
  } catch {}
};
