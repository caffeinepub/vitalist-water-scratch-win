import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration code on upgrade

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

  // Persistent data stores
  let submissions = Map.empty<Text, Submission>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
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

  // Submit a new claim - open to anyone (guest level, no auth check needed)
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

  // Get all submissions - admin only (contains personal data: UPI IDs, feedback)
  public query ({ caller }) func getAllSubmissions() : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    submissions.values().toArray();
  };

  // Get a single submission by coupon code - admin only (contains personal data)
  public query ({ caller }) func getSubmissionByCode(couponCode : Text) : async ?Submission {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view submissions");
    };
    submissions.get(couponCode);
  };

  // Get total number of submissions and reward breakdown - admin only
  public query ({ caller }) func getRewardStats() : async (Nat, [Nat]) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view reward stats");
    };
    let allSubmissions = submissions.values().toArray();
    let rewardAmounts = allSubmissions.map(func(s) { s.rewardAmount });
    (allSubmissions.size(), rewardAmounts);
  };

  // Update a submission's reward amount - admin only
  public shared ({ caller }) func updateRewardAmount(couponCode : Text, newRewardAmount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update reward amounts");
    };
    switch (submissions.get(couponCode)) {
      case (?submission) {
        let updatedSubmission = {
          couponCode = submission.couponCode;
          rewardAmount = newRewardAmount;
          state = submission.state;
          city = submission.city;
          feedback = submission.feedback;
          upiId = submission.upiId;
          timestamp = submission.timestamp;
          status = submission.status;
        };
        submissions.add(couponCode, updatedSubmission);
      };
      case (null) {
        Runtime.trap("Submission not found for couponCode: " # couponCode);
      };
    };
  };

  // Filter submissions by state - admin only (contains personal data)
  public query ({ caller }) func filterByState(state : Text) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter submissions");
    };
    let filtered = submissions.values().toArray().filter(
      func(s) { s.state == state }
    );
    filtered;
  };

  // Search submissions by coupon code prefix - admin only (contains personal data)
  public query ({ caller }) func searchByCouponPrefix(prefix : Text) : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can search submissions");
    };
    let filtered = submissions.values().toArray().filter(
      func(s) { s.couponCode.startsWith(#text(prefix)) }
    );
    filtered;
  };

  // Mark a submission as redeemed - admin only
  public shared ({ caller }) func markAsRedeemed(couponCode : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can mark submissions as redeemed");
    };
    switch (submissions.get(couponCode)) {
      case (?submission) {
        let updatedSubmission = {
          submission with status = "redeemed";
        };
        submissions.add(couponCode, updatedSubmission);
      };
      case (null) {
        Runtime.trap("Submission not found for couponCode: " # couponCode);
      };
    };
  };

  // Get only active submissions
  public query ({ caller }) func getActiveSubmissions() : async [Submission] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view active submissions");
    };
    let filtered = submissions.values().toArray().filter(
      func(s) { s.status == "active" }
    );
    filtered;
  };
};

