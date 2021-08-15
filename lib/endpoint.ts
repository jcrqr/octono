import { GHEndpoints } from "../deps.ts";
import { OctonoResponse } from "./response.ts";

export type Endpoints = {
  [K in EndpointPrefixed]: Operation<ExtractEndpoint<K>, ExtractMethod<K>>;
};

type Endpoint = keyof GHEndpoints;

type EndpointMethod<E extends Endpoint> = string & keyof GHEndpoints[E];

type EndpointPrefixed = Endpoint extends infer T
  ? T extends Endpoint
    ? `${Uppercase<EndpointMethod<T>>} ${T}`
    : never
  : never;

type ExtractEndpoint<EP extends EndpointPrefixed> =
  EP extends `${infer _M} ${infer E}` ? E : never;

type ExtractMethod<EP extends EndpointPrefixed> =
  EP extends `${infer M} ${infer E}`
    ? E extends Endpoint
      ? Lowercase<M> extends keyof GHEndpoints[E]
        ? Lowercase<M>
        : never
      : never
    : never;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L7
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L14
type ExtractParameters<T> = "parameters" extends keyof T
  ? UnionToIntersection<
      {
        [K in keyof T["parameters"]]: T["parameters"][K];
      }[keyof T["parameters"]]
    >
  : Record<string, unknown>;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L21
type ExtractRequestBody<T> = "requestBody" extends keyof T
  ? "content" extends keyof T["requestBody"]
    ? "application/json" extends keyof T["requestBody"]["content"]
      ? T["requestBody"]["content"]["application/json"]
      : {
          data: {
            [K in keyof T["requestBody"]["content"]]: T["requestBody"]["content"][K];
          }[keyof T["requestBody"]["content"]];
        }
    : "application/json" extends keyof T["requestBody"]
    ? T["requestBody"]["application/json"]
    : {
        data: {
          [K in keyof T["requestBody"]]: T["requestBody"][K];
        }[keyof T["requestBody"]];
      }
  : Record<string, unknown>;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L38
type ToOctonoParameters<T> = ExtractParameters<T> & ExtractRequestBody<T>;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L40
type RequiredPreview<T> = T extends string
  ? {
      mediaType: {
        previews: [T, ...string[]];
      };
    }
  : Record<string, unknown>;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L48
type Operation<
  Url extends keyof GHEndpoints,
  Method extends keyof GHEndpoints[Url],
  preview = unknown
> = {
  parameters: ToOctonoParameters<GHEndpoints[Url][Method]> &
    RequiredPreview<preview>;
  response: ExtractOctonoResponse<GHEndpoints[Url][Method]>;
};

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L71
type SuccessStatuses = 200 | 201 | 202 | 204;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L72
type RedirectStatuses = 301 | 302;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L73
type EmptyResponseStatuses = 201 | 204;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L74
type KnownJSONResponseTypes =
  | "application/json"
  | "application/scim+json"
  | "text/html";

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L79
type SuccessResponseDataType<Responses> = {
  [K in SuccessStatuses & keyof Responses]: GetContentKeyIfPresent<
    Responses[K]
  > extends never
    ? never
    : OctonoResponse<GetContentKeyIfPresent<Responses[K]>, K>;
}[SuccessStatuses & keyof Responses];

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L86
type RedirectResponseDataType<Responses> = {
  [K in RedirectStatuses & keyof Responses]: OctonoResponse<unknown, K>;
}[RedirectStatuses & keyof Responses];

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L89
type EmptyResponseDataType<Responses> = {
  [K in EmptyResponseStatuses & keyof Responses]: OctonoResponse<never, K>;
}[EmptyResponseStatuses & keyof Responses];

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L93
type GetContentKeyIfPresent<T> = "content" extends keyof T
  ? DataType<T["content"]>
  : DataType<T>;

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L96
type DataType<T> = {
  [K in KnownJSONResponseTypes & keyof T]: T[K];
}[KnownJSONResponseTypes & keyof T];

// https://github.com/octokit/types.ts/blob/v6.25.0/src/generated/Endpoints.ts#L99
type ExtractOctonoResponse<R> = "responses" extends keyof R
  ? SuccessResponseDataType<R["responses"]> extends never
    ? RedirectResponseDataType<R["responses"]> extends never
      ? EmptyResponseDataType<R["responses"]>
      : RedirectResponseDataType<R["responses"]>
    : SuccessResponseDataType<R["responses"]>
  : unknown;
