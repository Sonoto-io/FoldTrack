import { onMounted, watch } from 'vue'
import { useFoldEntriesStore } from '@/stores/foldEntries'
import { useAuthStore } from '@/stores/auth'
import { getEntries, syncEntries } from '@/api/entries'
import type {
  BodyCompositionEntry,
  BodyCompositionEntryInsert,
  BodyCompositionEntrySelect,
} from '@/features/shared/shared.types'

export const useEntrySyncer = () => {
  const entryStore = useFoldEntriesStore()
  const authStore = useAuthStore()

  syncEntriesService()

  watch(
    () => entryStore.entries,
    async (entries) => {
      await syncEntriesService()
    },
    { deep: true },
  )

  watch(
    () => authStore.isAuthenticated,
    async () => {
      // fethch entries and sync with local storage when the user is authenticated
      await syncEntriesService()
    },
  )
}

const mergeEntries = (
  entriesFromBackend: BodyCompositionEntrySelect[],
  entriesInLocalStorage: BodyCompositionEntry[],
): BodyCompositionEntry[] => {
  const entriesFromBackendWithoutId = entriesFromBackend.map((entry) => {
    const { user_id, id, ...rest } = entry
    return rest
  })
  return [...entriesFromBackendWithoutId, ...entriesInLocalStorage].reduce((acc, entry) => {
    if (!acc.find((e) => e.date === entry.date)) {
      acc.push(entry)
    }
    return acc
  }, [] as BodyCompositionEntry[])
}
const normalize = (obj: unknown): string => {
  if (Array.isArray(obj)) return JSON.stringify(obj.map(normalize))
  if (obj !== null && typeof obj === 'object') {
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(obj)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, JSON.parse(normalize(v))]),
      ),
    )
  }
  return JSON.stringify(obj)
}

const areEntriesSynced = (
  entriesFromBackend: BodyCompositionEntrySelect[],
  entriesInLocalStorage: BodyCompositionEntry[],
): boolean => {
  const entriesFromBackendNormalized = entriesFromBackend.map(({ user_id, id, ...rest }) => rest)

  if (entriesFromBackendNormalized.length !== entriesInLocalStorage.length) return false

  return entriesFromBackendNormalized.every((backendEntry) =>
    entriesInLocalStorage.some((localEntry) => normalize(backendEntry) === normalize(localEntry)),
  )
}

const updateBackendEntries = async (
  entries: BodyCompositionEntry[],
  isPremium: boolean,
  userId: string,
) => {
  const entriesWithUserId: BodyCompositionEntryInsert[] = entries.map((entry) => ({
    ...entry,
    user_id: userId,
  }))
  await syncEntries(entriesWithUserId, isPremium)
}

const syncEntriesService = async () => {
  const entryStore = useFoldEntriesStore()
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated || !authStore.user) return

  const entriesFromBackend = await getEntries(authStore.user.id)

  // The user may have logged out while the request above was in flight —
  // bail out instead of trusting the now-stale non-null guard above.
  if (!authStore.isAuthenticated || !authStore.user) return

  const entriesInLocalStorage = entryStore.entries

  if (!areEntriesSynced(entriesFromBackend.data ?? [], entriesInLocalStorage)) {
    const mergedEntries = mergeEntries(entriesFromBackend.data ?? [], entriesInLocalStorage)
    entryStore.entries = mergedEntries
    await updateBackendEntries(mergedEntries, authStore.isPremium, authStore.user.id)
  }
}
