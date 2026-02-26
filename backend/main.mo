import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";
import Nat "mo:core/Nat";

(with migration = Migration.run)
actor {
  type Submission = {
    couponCode : Text;
    rewardAmount : Nat;
    state : Text;
    city : Text;
    feedback : Text;
    upiId : Text;
    timestamp : Int;
  };

  let submissions = Map.empty<Text, Submission>();

  // Submit a new claim
  public shared ({ caller }) func submitClaim(
    couponCode : Text,
    rewardAmount : Nat,
    state : Text,
    city : Text,
    feedback : Text,
    upiId : Text,
  ) : async Bool {
    let submission : Submission = {
      couponCode;
      rewardAmount;
      state;
      city;
      feedback;
      upiId;
      timestamp = Time.now();
    };
    submissions.add(couponCode, submission);
    true;
  };

  // Get all submissions
  public query ({ caller }) func getAllSubmissions() : async [Submission] {
    submissions.values().toArray();
  };

  // Get a single submission by coupon code
  public query ({ caller }) func getSubmission(couponCode : Text) : async ?Submission {
    submissions.get(couponCode);
  };

  // Get total number of submissions and reward breakdown
  public query ({ caller }) func getRewardStats() : async (Nat, [Nat]) {
    let allSubmissions = submissions.values().toArray();
    let rewardAmounts = allSubmissions.map(func(s) { s.rewardAmount });
    (allSubmissions.size(), rewardAmounts);
  };

  // Update a submission's reward amount
  public shared ({ caller }) func updateRewardAmount(couponCode : Text, newRewardAmount : Nat) : async Bool {
    switch (submissions.get(couponCode)) {
      case (null) { false };
      case (?submission) {
        let updatedSubmission = {
          couponCode = submission.couponCode;
          rewardAmount = newRewardAmount;
          state = submission.state;
          city = submission.city;
          feedback = submission.feedback;
          upiId = submission.upiId;
          timestamp = submission.timestamp;
        };
        submissions.add(couponCode, updatedSubmission);
        true;
      };
    };
  };

  // Filter submissions by state
  public query ({ caller }) func filterByState(state : Text) : async [Submission] {
    let filtered = submissions.values().toArray().filter(
      func(s) { s.state == state }
    );
    filtered;
  };

  // Search submissions by coupon code prefix
  public query ({ caller }) func searchByCouponPrefix(prefix : Text) : async [Submission] {
    let filtered = submissions.values().toArray().filter(
      func(s) { s.couponCode.startsWith(#text(prefix)) }
    );
    filtered;
  };
};
