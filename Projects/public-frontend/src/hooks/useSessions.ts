import { useQuery } from '@tanstack/react-query'
import { fetchSessions } from '@/lib/mockApi'
import { Session } from '@/components/trial/SessionCard'

export function useSessions(type?: string) {
  return useQuery<Session[]>({
    queryKey: ['sessions', type],
    queryFn: () => fetchSessions(type),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

