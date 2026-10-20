'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMyProfile } from './users-profile-update.service';

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
