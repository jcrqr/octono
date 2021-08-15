import { Endpoints } from "./endpoint.ts";
import { OctonoRequest, OctonoRequestInit } from "./request.ts";
import { OctonoResponse } from "./response.ts";

export class Octono {
  // #_token?: string;

  async request<
    E extends keyof Endpoints,
    R extends Endpoints[E]["response"],
    P extends OctonoRequestInit = E extends keyof Endpoints
      ? Endpoints[E]["parameters"] & OctonoRequestInit
      : OctonoRequestInit
  >(endpoint: E, params?: P): Promise<R> {
    const req = OctonoRequest.fromEndpoint(endpoint, params);
    const resp = await fetch(req);

    return new OctonoResponse(await resp.blob(), resp) as R;
  }
}
