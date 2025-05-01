"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        // Start a transaction to handle both operations
        const result = await db.$transaction(  //transaction is used to ensure that all the three points steps of transactions occurs successfully and even if any one of them fails, the whole transaction fails.
            async (tx) => {
                // 1. First check if industry exists
                let industryInsight = await tx.industryInsight.findUnique({
                    where: {
                        industry: data.industry,
                    },
                });

                // 2.If industry doesn't exist, create it with default values
                if (!industryInsight) {
                    const insights = await generateAIInsights(data.industry);

                    industryInsight = await db.industryInsight.create({
                        data: {
                            industry: data.industry,
                            ...insights,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                    });
                }
                // if (!industryInsight) {
                //     industryInsight = await tx.industryInsight.create({
                //         data: {
                //             industry: data.industry,
                //             salaryRanges: [], // Default empty array
                //             growthRate: 0, // Default value
                //             demandLevel: "MEDIUM", // Default value
                //             topSkills: [], // Default empty array
                //             marketOutlook: "NEUTRAL", // Default value
                //             keyTrends: [], // Default empty array
                //             recommendedSkills: [], // Default empty array
                //             nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                //         },
                //     });
                // }


                // 3.Now update the user
                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        industry: data.industry,
                        experience: data.experience,
                        bio: data.bio,
                        skills: data.skills,
                    },
                });

                return { updatedUser, industryInsight };
            },
            {
                timeout: 10000, // default: 5000
            }
        );

        revalidatePath("/");
        return { success: true, ...result };
    } catch (error) {
        console.error("Error updating user and industry:", error.message);
        throw new Error("Failed to update profile");
    }
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            },
        });

        return {
            isOnboarded: !!user?.industry, //the !! (double negation) is a common JavaScript trick to convert a value into a boolean
        };
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        throw new Error("Failed to check onboarding status");
    }
}