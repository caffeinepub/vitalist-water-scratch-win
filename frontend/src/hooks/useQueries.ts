import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Submission } from '../backend';

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

export function useSearchByCouponPrefix() {
  const { actor } = useActor();
  return useMutation<Submission[], Error, string>({
    mutationFn: async (prefix: string) => {
      if (!actor) return [];
      return actor.searchByCouponPrefix(prefix);
    },
  });
}

export function useSubmitClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
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
      if (!actor) throw new Error('Actor not ready');
      return actor.submitClaim(couponCode, BigInt(rewardAmount), state, city, feedback, upiId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['rewardStats'] });
    },
  });
}
