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
