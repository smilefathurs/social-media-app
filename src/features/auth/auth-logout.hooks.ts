'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { clearAuthSession } from './auth-storage';
import { clearCredentials } from './auth.slice';

export function useLogoutMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      clearAuthSession();
    },

    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.clear();

      router.replace('/');
      router.refresh();
    },
  });
}
