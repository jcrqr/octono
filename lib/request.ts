import { Endpoints } from "./endpoint.ts";
import { Method } from "./method.ts";
import { parseEndpoint } from "./util.ts";

const GITHUB_URL = Deno.env.get("GITHUB_URL") || "https://api.github.com";

export interface OctonoRequestInit extends RequestInit {
  baseURL?: string;

  headers?: RequestInit["headers"] & {
    /**
     * Avoid setting `headers.accept`, use `mediaType.{format|previews}` option instead.
     */
    accept?: string;

    /**
     * Use `authorization` to send an authenticated request.
     * Example: `token 1234567890abcdef1234567890abcdef12345678`
     */
    authorization?: `bearer ${string}` | `token ${string}`;

    /**
     * `user-agent` is set to `octono` by default and can be overwritten as needed.
     */
    "user-agent"?: string;
  };

  /**
   * Media type options, see {@link https://developer.github.com/v3/media/ GitHub Developer Guide}
   */
  mediaType?: {
    /**
     * `json` by default. Can be `raw`, `text`, `html`, `full`, `diff`, `patch`, `sha`, `base64`. Depending on endpoint
     */
    format?: string;

    /**
     * Custom media type names of {@link https://developer.github.com/v3/media/ | API Previews} without the `-preview` suffix.
     * Example for single preview: `['squirrel-girl']`.
     * Example for multiple previews: `['squirrel-girl', 'mister-fantastic']`.
     */
    previews?: string[];
  };

  [k: string]: unknown;
}

export class OctonoRequest extends Request {
  constructor(input: OctonoRequest | string, init?: OctonoRequestInit) {
    super(input, init);
  }

  static fromEndpoint<
    E extends keyof Endpoints,
    P extends OctonoRequestInit = E extends keyof Endpoints
      ? Endpoints[E]["parameters"] & OctonoRequestInit
      : OctonoRequestInit,
  >(endpoint: E, params?: P): OctonoRequest {
    const baseURL = params?.baseURL ? params.baseURL : GITHUB_URL;

    const [method, route, extraParams] = parseEndpoint(endpoint, params || {});

    const url = new URL(route, baseURL);

    if (method === Method.GET) {
      for (const [name, value] of Object.entries(extraParams)) {
        url.searchParams.set(name, value);
      }
    }

    const init: OctonoRequestInit = {
      ...(params || {}),
      method,
      headers: {
        ...(params?.headers || {}),
        "user-agent": "octono",
      },
    };

    if (method !== Method.GET) {
      init.body = JSON.stringify(params || {});
    }

    return new OctonoRequest(url.toString(), init);
  }
}
