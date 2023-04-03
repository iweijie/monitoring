export const isBrowser = typeof window === "object" && window;

export const getURLPathname = (url: string): string => {
  if (URL && typeof URL === "function") {
    return new URL(url)?.pathname || url;
  }

  if (
    document &&
    document.createElement &&
    typeof document.createElement === "function"
  ) {
    const a = document.createElement("a");
    a.href = url;
    return a.pathname.replace(/^([^/])/, "/$1");
  }

  return url;
};
