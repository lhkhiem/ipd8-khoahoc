import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerTrial } from '@/lib/mockApi'

interface RegisterTrialData {
  sessionId: string
  name: string
  phone: string
  email: string
  message?: string
}

export function useRegisterTrial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterTrialData) => registerTrial(data),
    onSuccess: () => {
      // Invalidate sessions to refetch updated capacity
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

