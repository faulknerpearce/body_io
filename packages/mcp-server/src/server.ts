import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  buildActivityInsertPayload,
  buildInsertPayload,
  goals,
  mapActivityRow,
  mapRow,
  parseActivityInput,
  parseEntryInput,
  sumActivityTotals,
  sumTotals,
  todayISO,
  type ActivityUpdate,
  type Database,
  type FoodUpdate,
} from '@nutrition-tracker/shared'

export type NutritionSupabase = SupabaseClient<Database>

export function createSupabase(url: string, key: string): NutritionSupabase {
  return createClient<Database>(url, key)
}

export function createAuthenticatedSupabase(
  url: string,
  anonKey: string,
  accessToken: string,
): NutritionSupabase {
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

/** JSON Schema object inputs — strict shape Grok and other MCP clients expect. */
function objectSchema(
  properties: Record<string, Record<string, unknown>>,
  required?: string[],
): Tool['inputSchema'] {
  return {
    type: 'object',
    properties,
    ...(required?.length ? { required } : {}),
    additionalProperties: false,
  }
}

async function requireUserId(supabase: NutritionSupabase): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export const SERVER_NAME = 'nutrition_tracker'
export const SERVER_VERSION = '1.0.0'

export const tools: Tool[] = [
  {
    name: 'list_food_entries',
    description:
      'Nutrition Tracker: list food log entries and meals for a day (calories, protein, carbs, caffeine).',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'add_food_entry',
    description:
      'Nutrition Tracker: add a food or meal entry to the daily nutrition log with calories and macros.',
    inputSchema: objectSchema(
      {
        name: { type: 'string', description: 'Name of the food item' },
        description: { type: 'string', description: 'Optional description (e.g. Lunch)' },
        calories: { type: 'number', description: 'Calories (kcal)' },
        protein: { type: 'number', description: 'Protein in grams' },
        carbs: { type: 'number', description: 'Carbohydrates in grams' },
        caffeine: { type: 'number', description: 'Caffeine in mg (default 0)' },
        icon: { type: 'string', description: 'Font Awesome icon class (default fa-utensils)' },
        iconBg: { type: 'string', description: 'Background color hex (default #f4f4f5)' },
        iconColor: { type: 'string', description: 'Icon color hex (default #71717a)' },
      },
      ['name', 'calories', 'protein'],
    ),
  },
  {
    name: 'update_food_entry',
    description: 'Nutrition Tracker: update an existing food log entry by id.',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the entry to update' },
        name: { type: 'string' },
        description: { type: 'string' },
        calories: { type: 'number' },
        protein: { type: 'number' },
        carbs: { type: 'number' },
        caffeine: { type: 'number' },
        icon: { type: 'string' },
        iconBg: { type: 'string' },
        iconColor: { type: 'string' },
      },
      ['id'],
    ),
  },
  {
    name: 'delete_food_entry',
    description: 'Nutrition Tracker: delete a food log entry by id.',
    inputSchema: objectSchema(
      { id: { type: 'string', description: 'ID of the entry to delete' } },
      ['id'],
    ),
  },
  {
    name: 'get_daily_totals',
    description:
      'Nutrition Tracker: get daily nutrition totals (calories, protein, carbs, caffeine) and remaining macro goals.',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'list_activities',
    description:
      'Nutrition Tracker: list activity outputs (workouts) for a day — type, duration, distance, heart rate, calories burned.',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
  {
    name: 'add_activity',
    description:
      'Nutrition Tracker: log a manual activity output with type, duration, distance, heart rate, and calories burned.',
    inputSchema: objectSchema(
      {
        name: { type: 'string', description: 'Name of the activity (e.g. Morning Run)' },
        activityType: {
          type: 'string',
          description: 'Activity type (e.g. Run, Ride, Swim, Walk, Workout)',
        },
        durationMinutes: {
          type: 'number',
          description: 'Duration in minutes (converted to seconds internally)',
        },
        distanceKm: {
          type: 'number',
          description: 'Optional distance in kilometers',
        },
        averageHeartrate: {
          type: 'number',
          description: 'Optional average heart rate in bpm',
        },
        maxHeartrate: { type: 'number', description: 'Optional max heart rate in bpm' },
        calories: { type: 'number', description: 'Optional calories burned' },
      },
      ['name', 'activityType', 'durationMinutes'],
    ),
  },
  {
    name: 'update_activity',
    description: 'Nutrition Tracker: update an existing activity output by id.',
    inputSchema: objectSchema(
      {
        id: { type: 'string', description: 'ID of the activity to update' },
        name: { type: 'string' },
        activityType: { type: 'string' },
        durationMinutes: { type: 'number' },
        distanceKm: { type: 'number' },
        averageHeartrate: { type: 'number' },
        maxHeartrate: { type: 'number' },
        calories: { type: 'number' },
      },
      ['id'],
    ),
  },
  {
    name: 'delete_activity',
    description: 'Nutrition Tracker: delete an activity output by id.',
    inputSchema: objectSchema(
      { id: { type: 'string', description: 'ID of the activity to delete' } },
      ['id'],
    ),
  },
  {
    name: 'get_activity_totals',
    description:
      'Nutrition Tracker: get daily activity totals (calories burned, total duration, total distance).',
    inputSchema: objectSchema({
      date: {
        type: 'string',
        description: 'ISO date (YYYY-MM-DD) to filter on. Defaults to today.',
      },
    }),
  },
]

export function createServer(supabase: NutritionSupabase): Server {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      capabilities: { tools: { listChanged: false } },
      instructions:
        'Nutrition Tracker tools for food inputs and activity outputs. Food: list_food_entries, get_daily_totals, add_food_entry, update_food_entry, delete_food_entry. Activities: list_activities, get_activity_totals, add_activity, update_activity, delete_activity. All data is scoped to the signed-in user.',
    },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    const a = (args ?? {}) as Record<string, unknown>

    try {
      switch (name) {
        case 'list_food_entries': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('food_entries')
            .select('*')
            .eq('entry_date', date)
            .order('created_at', { ascending: true })
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify((data ?? []).map(mapRow)) }] }
        }

        case 'add_food_entry': {
          const parsed = parseEntryInput(a)
          if (!parsed.ok) throw new Error(parsed.error)

          const userId = await requireUserId(supabase)
          const entry = {
            ...buildInsertPayload(parsed.value, crypto.randomUUID(), userId),
            entry_date: todayISO(),
          }
          const { data, error } = await supabase
            .from('food_entries')
            .insert(entry)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapRow(data)) }] }
        }

        case 'update_food_entry': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')

          const updates: FoodUpdate = {}
          const stringFields = {
            name: 'name',
            description: 'description',
            icon: 'icon',
            iconBg: 'icon_bg',
            iconColor: 'icon_color',
          } as const
          for (const [jsKey, dbKey] of Object.entries(stringFields)) {
            if (a[jsKey] !== undefined) (updates as Record<string, unknown>)[dbKey] = a[jsKey]
          }
          for (const field of ['calories', 'protein', 'carbs', 'caffeine'] as const) {
            if (typeof a[field] === 'number')
              (updates as Record<string, unknown>)[field] = Math.round(a[field] as number)
          }

          const { data, error } = await supabase
            .from('food_entries')
            .update(updates)
            .eq('id', a.id)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapRow(data)) }] }
        }

        case 'delete_food_entry': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')
          const { error } = await supabase.from('food_entries').delete().eq('id', a.id)
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify({ ok: true }) }] }
        }

        case 'get_daily_totals': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('food_entries')
            .select('*')
            .eq('entry_date', date)
          if (error) throw error
          const totals = sumTotals((data ?? []).map(mapRow))
          return { content: [{ type: 'text', text: JSON.stringify({ totals, goals, date }) }] }
        }

        case 'list_activities': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('activity_date', date)
            .order('created_at', { ascending: true })
          if (error) throw error
          return {
            content: [{ type: 'text', text: JSON.stringify((data ?? []).map(mapActivityRow)) }],
          }
        }

        case 'add_activity': {
          const parsed = parseActivityInput(a)
          if (!parsed.ok) throw new Error(parsed.error)

          const userId = await requireUserId(supabase)
          const activity = buildActivityInsertPayload(
            parsed.value,
            crypto.randomUUID(),
            userId,
            todayISO(),
          )
          const { data, error } = await supabase
            .from('activities')
            .insert(activity)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapActivityRow(data)) }] }
        }

        case 'update_activity': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')

          const updates: ActivityUpdate = {}
          if (typeof a.name === 'string') updates.name = a.name
          if (typeof a.activityType === 'string') updates.activity_type = a.activityType
          if (typeof a.durationMinutes === 'number') {
            updates.moving_time_seconds = Math.round(a.durationMinutes * 60)
          }
          if (typeof a.distanceKm === 'number') {
            updates.distance_meters = Math.round(a.distanceKm * 1000)
          }
          if (typeof a.averageHeartrate === 'number') {
            updates.average_heartrate = Math.round(a.averageHeartrate)
          }
          if (typeof a.maxHeartrate === 'number') {
            updates.max_heartrate = Math.round(a.maxHeartrate)
          }
          if (typeof a.calories === 'number') {
            updates.calories = Math.round(a.calories)
          }

          const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', a.id)
            .select()
            .single()
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify(mapActivityRow(data)) }] }
        }

        case 'delete_activity': {
          if (typeof a.id !== 'string' || a.id === '') throw new Error('id is required')
          const { error } = await supabase.from('activities').delete().eq('id', a.id)
          if (error) throw error
          return { content: [{ type: 'text', text: JSON.stringify({ ok: true }) }] }
        }

        case 'get_activity_totals': {
          const date = typeof a.date === 'string' ? a.date : todayISO()
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('activity_date', date)
          if (error) throw error
          const totals = sumActivityTotals((data ?? []).map(mapActivityRow))
          return { content: [{ type: 'text', text: JSON.stringify({ totals, date }) }] }
        }

        default:
          throw new Error(`Unknown tool: ${name}`)
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${(err as Error).message}` }],
        isError: true,
      }
    }
  })

  return server
}
