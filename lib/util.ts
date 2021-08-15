import { Method } from "./method.ts";

export function startsWithMethod(str: string) {
  const [method] = str.split(" ");

  if (!method) {
    return false;
  }

  return Object.values(Method).includes(method as Method);
}

export function startsWithHTTP(str: string) {
  return new RegExp(/http(s):\/\/.+/).test(str);
}

export function parseEndpoint(
  str: string,
  params: Record<string, unknown>
): [string, string, Record<string, string>] {
  const [method, endpoint] = str.split(" ");

  const pathParams = endpoint
    .split("/")
    .map((p) => (p.match(/{(.+)}/) || [])[1])
    .filter((p) => !!p);

  const extraParams = Object.entries(params)
    .filter(([p]) => !pathParams.includes(p))
    .reduce((m, [p, d]) => ({ ...m, [p]: d }), {});

  const endpointWithParams = endpoint
    .split("/")
    .map((part) => {
      const pathParam = pathParams.find((p) => part === `{${p}}`);
      if (!pathParam) {
        return part;
      }
      return part.replace(`{${pathParam}}`, params[pathParam] as string);
    })
    .join("/");

  return [method, endpointWithParams, extraParams];
}
