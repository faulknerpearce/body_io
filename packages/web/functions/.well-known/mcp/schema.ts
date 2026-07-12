/// <reference types="@cloudflare/workers-types" />

import { handlePublicToolSchema } from '@body-io/mcp-server/schema'

export const onRequest = async () => handlePublicToolSchema()
