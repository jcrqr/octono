export interface OctonoResponseInit<S extends number = number> extends ResponseInit {
  status: S
  // headers: ResponseInit["headers"] & {
  //   "cache-control"?: string;
  //   "content-length"?: number;
  //   "content-type"?: string;
  //   date?: string;
  //   etag?: string;
  //   "last-modified"?: string;
  //   link?: string;
  //   location?: string;
  //   server?: string;
  //   status?: string;
  //   vary?: string;
  //   "x-github-mediatype"?: string;
  //   "x-github-request-id"?: string;
  //   "x-oauth-scopes"?: string;
  //   "x-ratelimit-limit"?: string;
  //   "x-ratelimit-remaining"?: string;
  //   "x-ratelimit-reset"?: string;
  // };
}

export class OctonoResponse<
  T extends unknown,
  S extends number = number
> extends Response {
  public status: S

  constructor(body?: BodyInit, init?: OctonoResponseInit<S>) {
    super(body, init);

    this.status = (init?.status || 0 as S)
  }

  json(): Promise<T> {
    return super.json()
  }
}
