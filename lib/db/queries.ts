import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  ActivityType,
  teamMembers,
  teams,
  users,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.team || null;
}

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, extractKeyFromPublicUrl } from "@/lib/s3";

export async function updateUserProfilePicture(userId: number, url: string): Promise<void> {
  const currentUser = await db
    .select({
      oldUrl: users.profilePictureUrl,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  if (currentUser.length === 0) {
    throw new Error(`User ${userId} not found`);
  }

  const { oldUrl, teamId } = currentUser[0];

  // Delete old avatar if it exists and is different
  if (oldUrl && oldUrl !== url) {
    try {
      const key = extractKeyFromPublicUrl(oldUrl);
      if (key?.startsWith("avatars/") && process.env.R2_BUCKET_NAME) {
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
        );
      }
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  // Update user record
  await db
    .update(users)
    .set({ profilePictureUrl: url, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Log activity if user is in a team
  if (teamId) {
    try {
      await db.insert(activityLogs).values({
        userId,
        teamId,
        action: ActivityType.UPDATE_ACCOUNT,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }
}
