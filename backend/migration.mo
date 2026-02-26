import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  type Submission = {
    couponCode : Text;
    rewardAmount : Nat;
    state : Text;
    city : Text;
    feedback : Text;
    upiId : Text;
    timestamp : Int;
  };

  type OldActor = {};

  type NewActor = {
    submissions : Map.Map<Text, Submission>;
  };

  public func run(_old : OldActor) : NewActor {
    {
      submissions = Map.empty<Text, Submission>();
    };
  };
};
