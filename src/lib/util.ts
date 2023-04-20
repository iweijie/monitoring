export function isObject(input: any): boolean {
  return Object.prototype.toString.call(input) === "[object Object]";
}

export function getPageUrl(): string {
  return window.location.href;
}

export function getNetworkType(): string {
  return (navigator as any).connection
    ? (navigator as any).connection.effectiveType
    : "";
}

export function getLocaleLanguage() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

export function replaceSlash(url: string) {
  return url.replace(/^\/|\/$/g, "");
}

export function convertObjToUrlencoded(obj: { [key: string]: any }): string {
  return new URLSearchParams(Object.entries(obj)).toString();
}

export function get<T = any>(
  obj: {
    [key: string]: any;
  },
  path: string,
  defaultValue: T
): T {
  try {
    const paths = path.split(".");
    let value;
    for (let i = 0; i < paths.length; i++) {
      value = obj[paths[i]];
    }

    return value;
  } catch (err) {
    return defaultValue;
  }
}

export const jsonStringifySafe = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (err) {
    return "";
  }
};

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

export const isSamePathname = (url: string, url1: string) => {
  if (url === url1) return true;
  const urlPathname = getURLPathname(url);
  const urlPathname1 = getURLPathname(url1);
  if (urlPathname && urlPathname1 && urlPathname === urlPathname1) return true;
  return false;
};
