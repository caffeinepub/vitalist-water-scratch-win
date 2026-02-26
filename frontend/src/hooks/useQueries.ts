import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Submission, UserProfile } from '../backend';

// ─── Error Helpers ────────────────────────────────────────────────────────────

/**
 * Detects IC0508 "canister is stopped" errors and returns a user-friendly message.
 * Returns null if the error is not a canister-stopped error.
 */
function getCanisterStoppedMessage(e: unknown): string | null {
  const msg = e instanceof Error ? e.message : String(e);
  const lower = msg.toLowerCase();
  if (
    lower.includes('ic0508') ||
    lower.includes('canister is stopped') ||
    lower.includes('reject_code: 5') ||
    lower.includes('reject_code":5') ||
    lower.includes('"reject_code":5') ||
    lower.includes('non_replicated_rejection')
  ) {
    return 'Service temporarily unavailable. Please try again in a moment.';
  }
  return null;
}

function normalizeError(e: unknown): Error {
  const friendly = getCanisterStoppedMessage(e);
  if (friendly) return new Error(friendly);
  return e instanceof Error ? e : new Error(String(e));
}

// ─── User Profile ────────────────────────────────────────────────────────────

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
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.saveCallerUserProfile(profile);
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Claim Submission ─────────────────────────────────────────────────────────

export function useSubmitClaim() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      couponCode: string;
      rewardAmount: number;
      state: string;
      city: string;
      feedback: string;
      upiId: string;
    }) => {
      // Wait for actor to be ready
      if (isFetching) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (!actor) throw new Error('Service not available. Please try again.');
      try {
        await actor.submitClaim(
          params.couponCode,
          BigInt(params.rewardAmount),
          params.state,
          params.city,
          params.feedback,
          params.upiId,
        );
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    onSuccess: () => {
      // Invalidate all submission-related queries so AdminPanel refetches
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['rewardStats'] });
    },
  });
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

export function useGetAllSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Submission[]>({
    queryKey: ['allSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getAllSubmissions();
        return result;
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useGetActiveSubmissions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Submission[]>({
    queryKey: ['activeSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getActiveSubmissions();
        return result;
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

/**
 * Looks up a single submission by exact coupon code.
 * Uses searchByCouponPrefix and filters for an exact match since the backend
 * does not expose a dedicated getSubmissionByCode endpoint.
 */
export function useGetSubmissionByCode(couponCode: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Submission | null>({
    queryKey: ['submission', couponCode],
    queryFn: async () => {
      if (!actor || !couponCode) return null;
      try {
        // searchByCouponPrefix returns all submissions whose couponCode starts with the prefix.
        // Since coupon codes are unique (VW-XXXX-XXXX), searching the full code gives exactly one result.
        const results = await actor.searchByCouponPrefix(couponCode);
        // Find the exact match
        const exact = results.find((s) => s.couponCode === couponCode);
        return exact ?? null;
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    enabled: !!actor && !actorFetching && !!couponCode,
    retry: 1,
    staleTime: 0,
  });
}

export function useGetRewardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ total: number; amounts: number[] }>({
    queryKey: ['rewardStats'],
    queryFn: async () => {
      if (!actor) return { total: 0, amounts: [] };
      try {
        const [total, amounts] = await actor.getRewardStats();
        return {
          total: Number(total),
          amounts: amounts.map(Number),
        };
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAsRedeemed() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponCode: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.markAsRedeemed(couponCode);
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['rewardStats'] });
      // Also invalidate individual submission lookups
      queryClient.invalidateQueries({ queryKey: ['submission'] });
    },
  });
}

export function useSearchByCouponPrefix() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (prefix: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        const result = await actor.searchByCouponPrefix(prefix);
        return result;
      } catch (e: unknown) {
        throw normalizeError(e);
      }
    },
  });
}
