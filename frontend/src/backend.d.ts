import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Submission {
    couponCode: string;
    rewardAmount: bigint;
    city: string;
    feedback: string;
    state: string;
    timestamp: bigint;
    upiId: string;
}
export interface backendInterface {
    filterByState(state: string): Promise<Array<Submission>>;
    getAllSubmissions(): Promise<Array<Submission>>;
    getRewardStats(): Promise<[bigint, Array<bigint>]>;
    getSubmission(couponCode: string): Promise<Submission | null>;
    searchByCouponPrefix(prefix: string): Promise<Array<Submission>>;
    submitClaim(couponCode: string, rewardAmount: bigint, state: string, city: string, feedback: string, upiId: string): Promise<boolean>;
    updateRewardAmount(couponCode: string, newRewardAmount: bigint): Promise<boolean>;
}
