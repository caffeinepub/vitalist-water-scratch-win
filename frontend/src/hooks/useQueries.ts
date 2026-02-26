import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Submission, UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSubmitClaim() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      couponCode: string;
      rewardAmount: number;
      state: string;
      city: string;
      feedback: string;
      upiId: string;
    }
  >({
    mutationFn: async ({ couponCode, rewardAmount, state, city, feedback, upiId }) => {
      if (isFetching) {
        // Wait a moment and retry if actor is still initializing
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (!actor) throw new Error('Service not ready. Please try again in a moment.');
      try {
        await actor.submitClaim(
          couponCode,
          BigInt(rewardAmount),
          state,
          city,
          feedback,
          upiId
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
            ? err
            : 'Submission failed. Please try again.';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['rewardStats'] });
    },
  });
}

export function useGetAllSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSubmissionByCode(couponCode: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Submission | null>({
    queryKey: ['submissionByCode', couponCode],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSubmissionByCode(couponCode);
    },
    enabled: !!actor && !isFetching && !!couponCode,
  });
}

export function useGetRewardStats() {
  const { actor, isFetching } = useActor();

  return useQuery<[bigint, bigint[]]>({
    queryKey: ['rewardStats'],
    queryFn: async () => {
      if (!actor) return [BigInt(0), []];
      return actor.getRewardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkAsRedeemed() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (couponCode: string) => {
      if (!actor) throw new Error('Actor not ready');
      try {
        await actor.markAsRedeemed(couponCode);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
            ? err
            : 'Failed to mark as redeemed.';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['rewardStats'] });
      queryClient.invalidateQueries({ queryKey: ['submissionByCode'] });
    },
  });
}
