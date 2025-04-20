import React from "react";
import { industries } from "../../../data/Industries";
import onboardingForm from "./_components/onboarding-form";

function OnBoardingPage() {
  return (
    <main>
      <onboardingForm industries={industries} />
    </main>
  );
}

export default OnBoardingPage;
