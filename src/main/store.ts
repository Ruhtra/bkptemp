import Store, { Schema } from 'electron-store'
Store.initRenderer()
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const zodOptionsSchema = z.object({
  darkMode: z.boolean().default(true),
  backupConfig: z
    .object({
      backupFiles: z.array(z.string()).default([]),
      dayToKeep: z.number().min(1).max(7).default(7)
    })
    .default({})
})

type Options = z.infer<typeof zodOptionsSchema>
const optionsObject = Object.fromEntries(
  Object.entries(zodToJsonSchema(zodOptionsSchema)).filter(
    ([key]) => key !== 'type' && key !== 'additionalProperties' && key !== '$schema'
  )
)['properties']

export const optionsSchema: Schema<Options> = optionsObject as Schema<Options>

export const store = new Store<Options>({
  schema: optionsSchema,
  migrations: {
    '1.0.0': (store) => {}
  }
})

// Função para acessar as configurações
export const getSettings = (): Options => store.store

// Função para atualizar as configurações
export const setSettings = (newSettings: Options): void => {
  store.set(newSettings)
}
