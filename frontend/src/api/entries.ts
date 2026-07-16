import type {
  BodyCompositionEntryInsert,
  BodyCompositionEntrySelect,
} from '@/features/shared/shared.types.ts'
import { api } from './client.ts'
import { transformToCamel, transformToSnake } from '@/features/shared/shared.services.ts'

export const addEntries = async (entries: BodyCompositionEntrySelect[]) => {
  let payload = entries.map(transformToSnake)
  const { data, error } = await api.from('body_composition_entries').insert(payload)
  return { data, error }
}

export const getEntries = async (
  userId: string,
): Promise<{ data: BodyCompositionEntrySelect[] | null; error: Error | null }> => {
  const { data, error } = await api
    .from('body_composition_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  const transformedData = data?.map(transformToCamel) as BodyCompositionEntrySelect[] | null
  return { data: transformedData, error }
}

const deleteEntries = async (entryIds: string[]) => {
  const { data, error } = await api.from('body_composition_entries').delete().in('id', entryIds)
  return { data, error }
}

export const deleteAllEntries = async (userId: string) => {
  const { data, error } = await api.from('body_composition_entries').delete().eq('user_id', userId)
  return { data, error }
}

export const deleteEntryByDate = async (userId: string, date: string) => {
  const { data, error } = await api
    .from('body_composition_entries')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)
  return { data, error }
}

const updateEntries = async (entries: BodyCompositionEntryInsert[]) => {
  const payload = entries.map(transformToSnake)
  const { data, error } = await api
    .from('body_composition_entries')
    .upsert(payload, { onConflict: 'date' })
  return { data, error }
}

export const syncEntries = async (entries: BodyCompositionEntryInsert[], isPremium: boolean) => {
  const { data, error } = await updateEntries(entries)
  // if not premium, remove old entries above 4 lasts
  if (!isPremium) {
    const allEntriesSync = await api.from('body_composition_entries').select('*')
    const entriesToDelete = allEntriesSync.data?.slice(0, -4).map((entry) => entry.id)
    if (entriesToDelete && entriesToDelete.length > 0) {
      await deleteEntries(entriesToDelete)
    }
  }
  return { data, error }
}
