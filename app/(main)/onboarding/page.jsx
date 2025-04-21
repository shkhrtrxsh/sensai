import React from "react";
import { industries } from "../../../data/Industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "../../../actions/user";
import { redirect } from "next/navigation";

async function OnBoardingPage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (isOnboarded) {
    redirect("/dashboard");
  }
  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}

export default OnBoardingPage;
