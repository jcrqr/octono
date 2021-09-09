import { Endpoints } from "./endpoint.ts";
import { OctonoRequest, OctonoRequestInit } from "./request.ts";
import { OctonoResponse } from "./response.ts";
import { HttpLinkHeader } from "../deps.ts";

export class Octono {
  // #_token?: string;

  async request<
    E extends keyof Endpoints,
    R extends Endpoints[E]["response"],
    P extends OctonoRequestInit = E extends keyof Endpoints
      ? Endpoints[E]["parameters"] & OctonoRequestInit
      : OctonoRequestInit,
  >(endpoint: E, params?: P): Promise<R> {
    const req = OctonoRequest.fromEndpoint(endpoint, params);
    const resp = await fetch(req);

    return new OctonoResponse(await resp.blob(), resp) as R;
  }

  paginated<
    E extends keyof Endpoints,
    R extends Endpoints[E]["response"],
    P extends OctonoRequestInit = E extends keyof Endpoints
      ? Endpoints[E]["parameters"] & OctonoRequestInit
      : OctonoRequestInit,
  >(endpoint: E, params?: P): Promise<R> {
    return this.doPaginated(endpoint, params, { page: 1, perPage: 100 });
  }

  private async doPaginated<
    E extends keyof Endpoints,
    R extends Endpoints[E]["response"],
    P extends OctonoRequestInit = E extends keyof Endpoints
      ? Endpoints[E]["parameters"] & OctonoRequestInit
      : OctonoRequestInit,
  >(
    endpoint: E,
    params: P | undefined,
    pagination: { page: number; perPage: number },
    results?: R,
  ): Promise<R> {
    const resp = await this.request(endpoint, {
      ...params,
      page: pagination.page.toString(),
      per_page: pagination.perPage.toString(),
    });

    if (!resp.ok) {
      return resp as R;
    }

    const linkHeader = resp.headers.get("link");

    if (!linkHeader) {
      return resp as R;
    }

    const links = HttpLinkHeader.parse(resp.headers.get("link"));
    const firstLink = links.rel("first")[0];
    const lastLink = links.rel("last")[0];

    const resultsData = results ? await results.json() as Array<unknown> : [];
    const respData = await resp.json() as Array<unknown>;

    const blob = new Blob(
      [(new TextEncoder()).encode(
        JSON.stringify([...resultsData, ...respData]),
      )],
    );

    const newResp = new OctonoResponse(blob, resp);

    // The last page includes a link with rel "first" but not
    // a link with rel "last" so we know when to stop recursively
    // requesting new data
    if (firstLink && !lastLink) {
      return newResp as R;
    }

    return this.doPaginated(endpoint, params, {
      ...pagination,
      page: pagination.page + 1,
    }, newResp as R);
  }
}
