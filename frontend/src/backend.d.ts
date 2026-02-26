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
    status: string;
    couponCode: string;
    rewardAmount: bigint;
    city: string;
    feedback: string;
    state: string;
    timestamp: bigint;
    upiId: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    filterByState(state: string): Promise<Array<Submission>>;
    getActiveSubmissions(): Promise<Array<Submission>>;
    getAllSubmissions(): Promise<Array<Submission>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRewardStats(): Promise<[bigint, Array<bigint>]>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAsRedeemed(couponCode: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchByCouponPrefix(prefix: string): Promise<Array<Submission>>;
    submitClaim(couponCode: string, rewardAmount: bigint, state: string, city: string, feedback: string, upiId: string): Promise<void>;
}
