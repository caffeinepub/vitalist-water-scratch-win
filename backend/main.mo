import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Submission = {
    couponCode : Text;
    rewardAmount : Nat;
    state : Text;
    city : Text;
    feedback : Text;
    upiId : Text;
    timestamp : Int;
    status : Text; // "active" or "redeemed"
  };

  public type UserProfile = {
    name : Text;
  };

  let submissions = Map.empty<Text, Submission>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  // --- User profile functions (required by frontend) ---

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Submission functions ---

  // User-facing submission endpoint (no admin check)
  public shared ({ caller }) func submitClaim(
    couponCode : Text,
    rewardAmount : Nat,
    state : Text,
    city : Text,
    feedback : Text,
    upiId : Text,
  ) : async () {
    let submission : Submission = {
      couponCode;
      rewardAmount;
      state;
      city;
      feedback;
      upiId;
      timestamp = Time.now();
      status = "active";
    };
    submissions.add(couponCode, submission);
  };

  // --- Drop all admin checks here! ---

  // Get all submissions (removes admin check)
  public query ({ caller }) func getAllSubmissions() : async [Submission] {
    submissions.values().toArray();
  };

  // Get reward stats (removes admin check)
  public query ({ caller }) func getRewardStats() : async (Nat, [Nat]) {
    let allSubmissions = submissions.values().toArray();
    let rewardAmounts = allSubmissions.map(func(s) { s.rewardAmount });
    (allSubmissions.size(), rewardAmounts);
  };

  // Mark as redeemed (removes admin check)
  public shared ({ caller }) func markAsRedeemed(couponCode : Text) : async () {
    switch (submissions.get(couponCode)) {
      case (?submission) {
        submissions.add(
          couponCode,
          {
            submission with status = "redeemed";
          },
        );
      };
      case (null) {
        Runtime.trap("Submission not found for couponCode: " # couponCode);
      };
    };
  };

  // -- Other useful query functions (no admin check) --

  public query ({ caller }) func getActiveSubmissions() : async [Submission] {
    let filtered = submissions.values().toArray().filter(
      func(s) { s.status == "active" }
    );
    filtered;
  };

  public query ({ caller }) func filterByState(state : Text) : async [Submission] {
    let filtered = submissions.values().toArray().filter(
      func(s) { s.state == state }
    );
    filtered;
  };

  public query ({ caller }) func searchByCouponPrefix(prefix : Text) : async [Submission] {
    let filtered = submissions.values().toArray().filter(
      func(s) { s.couponCode.startsWith(#text(prefix)) }
    );
    filtered;
  };
};
