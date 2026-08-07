# AGENTS.md

Serverless Framework v4 + TypeScript reference template. One deployable service; all infra lives in `serverless.yml`. See `README.md` for the full guide.

## Commands
- `pnpm typecheck` — `tsc --noEmit` (type-check only; esbuild does the real bundling)
- `pnpm lint` — `eslint src` (flat config, eslint 10, `no-explicit-any` is a *warning*)
- `pnpm test` — jest + ts-jest, matches `**/*.spec.test.ts` only; sets `LOCAL=true` env
- `pnpm test:unit` — same, watch mode
- `pnpm offline` — serverless-offline on **port 5001** (`--stage local`)
- Verification order: `typecheck` → `test` → `lint`

## Gotchas
- **`serverless` CLI needs v4 login/license.** `pnpm offline`/`package`/`deploy:*` will fail with `ERR_SLS_...` auth errors in a fresh session. To sanity-check bundling without it, bundle manually and load exports:
  `node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/bin/esbuild src/handler.ts --bundle --platform=node --target=node22 --format=cjs '--external:@aws-sdk/*' --outfile=.build/test/handler.js` then `require()` it and assert `run`/`cAuthorizer` exports.
- **Offline port is 5001**, not 5000 (macOS ControlCenter owns 5000). `--stage local` also drives the CORS middleware (`LAMBDA_STAGE === 'local'` → allow any origin).
- **pnpm 11 reads all settings from `pnpm-workspace.yaml` — the `pnpm` field in `package.json` is ignored.** Build scripts of native deps need `allowBuilds: <pkg>: true`; packages published <24h ago need `minimumReleaseAgeExclude`; dep overrides live under `overrides:`. If `pnpm install` reports `ERR_PNPM_IGNORED_BUILDS`, add the package there.
- **tsconfig uses `module: Preserve` + `moduleResolution: Bundler`** because TS 6 removed `node10`/`baseUrl`. Don't reintroduce `baseUrl`; path values need `./` prefixes.
- **No path aliases.** `#utils/...`, `#src/...` were removed — use relative imports only.
- **No pre-commit hooks actually run.** husky/lint-staged are declared but there is no `.husky/` dir or `prepare` script.
- **`no-explicit-any` is warn-only**, so the build stays green with remaining `any` in `src/utils/validationHelper.ts` and `src/utils/dynamoDbHelper.ts`.

## Architecture
- HTTP functions (`common`, `todo`, `order`, `upload`) all point at `src/handler.ts` `run`; `lambda-api` (base path `/v1`) routes via `src/routes.ts`. Event-only functions expose their own entry: `src/functions/orderProcessor/orderProcessor.ts` (SQS) and `src/functions/dailyJob/dailyJob.ts` (cron). `cAuthorizer` validates Cognito tokens.
- `src/controller.ts` exports the `Attributes` data bag typed per feature's needs; services narrow with validated casts. `extraData` is `AuthorizerContext` from `src/utils/cognitoHelper.ts`.
- AWS SDK v3 via `@aws-sdk/lib-dynamodb` **DocumentClient** — pass plain JS values, never `{ S: "..." }`. SQS/S3 helpers in `src/utils/`.
- esbuild config in `serverless.yml` (`build.esbuild`) excludes `@aws-sdk/*`; runtime is `nodejs22.x`. Handlers are referenced as `.ts` files.
- `plugins/my-plugin.js` manages the deployment bucket (handles object-or-string `deploymentBucket`).
