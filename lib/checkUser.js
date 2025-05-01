//Checks weather user is logged in or not??
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        });
        // checks if user is already stored in database
        if (loggedInUser) {
            return loggedInUser;
        }
        //create new user if user isn't already in db
        const name = `${user.firstName} ${user.lastName}`;

        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                name,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress,
            },
        });

        return newUser;
    } catch (error) {
        console.log(error.message);
    }
};