/// <reference types="@cloudflare/workers-types" />

import { handleAuthorize } from '@body-io/mcp-server/oauth'
import { resolveOAuthEnv, type PagesOAuthEnv } from './_oauth-env'

export const onRequest = async (context: EventContext<PagesOAuthEnv, string, unknown>) => {
  return handleAuthorize(context.request, resolveOAuthEnv(context.request, context.env))
}
