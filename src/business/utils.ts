export const isBrowser = typeof window === "object" && window;

export const getURLPathname = (url: string): string => {
  if (URL && typeof URL === "function") {
    try {
      return new URL(url)?.pathname || url;
    } catch (err) {
      //
    }
  }

  if (
    document &&
    document.createElement &&
    typeof document.createElement === "function"
  ) {
    try {
      const a = document.createElement("a");
      a.href = url;
      return a.pathname.replace(/^([^/])/, "/$1");
    } catch (err) {
      //
    }
  }

  return url;
};

export const getURLQuery = (url: string): string => {
  if (URL && typeof URL === "function") {
    try {
      return new URL(url)?.search.slice(1);
    } catch (err) {
      //
    }
  }

  if (
    document &&
    document.createElement &&
    typeof document.createElement === "function"
  ) {
    try {
      const a = document.createElement("a");
      a.href = url;
      return a.search.slice(1);
    } catch (err) {
      //
    }
  }

  try {
    const [, search] = url.split("?");
    return search;
  } catch (err) {
    //
  }

  return url;
};
