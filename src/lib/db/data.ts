import { db } from '@/lib/db';
import { reviews, users } from '@/lib/db/schema';
import { verifySession } from '@/lib/session';
import { desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session?.isAuth) return null;

  const data = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId as string));

  const user = data[0];

  return user;
});

export async function getMovieReviews(movieId: number) {
  return unstable_cache(
    async () => {
      const movieReviews = await db
        .select({
          id: reviews.id,
          movieId: reviews.movieId,
          userId: reviews.userId,
          rating: reviews.rating,
          content: reviews.content,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
          userName: users.name,
        })
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .leftJoin(users, eq(reviews.userId, users.id))
        .where(eq(reviews.movieId, movieId))
        .limit(10);

      return movieReviews;
    },
    ['getMovieReviews', String(movieId)],
    {
      // Revalidated by `revalidateTag('movieReviews')` in server actions.
      tags: ['movieReviews'],
      revalidate: 60 * 60,
    }
  )();
}

export async function getUserReviews(userId: string) {
  return unstable_cache(
    async () => {
      const userReviews = await db
        .select({
          id: reviews.id,
          movieId: reviews.movieId,
          userId: reviews.userId,
          rating: reviews.rating,
          content: reviews.content,
          createdAt: reviews.createdAt,
          updatedAt: reviews.updatedAt,
        })
        .from(reviews)
        .orderBy(desc(reviews.createdAt))
        .where(eq(reviews.userId, userId))
        .limit(4);

      return userReviews;
    },
    ['getUserReviews', userId],
    {
      // Revalidated by `revalidateTag('userReviews')` in server actions.
      tags: ['userReviews'],
      revalidate: 60 * 60,
    }
  )();
}

export async function getReviewById(reviewId: string) {
  return unstable_cache(
    async () => {
      const review = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId))
        .limit(1);

      return review[0];
    },
    ['getReviewById', reviewId],
    {
      tags: [`review-${reviewId}`],
      revalidate: 60 * 60,
    }
  )();
}
