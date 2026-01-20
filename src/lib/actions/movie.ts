'use server';

import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import {
  CreateMovieReviewFormSchema,
  CreateMovieReviewFormState,
  UpdateMovieReviewFormSchema,
  UpdateMovieReviewFormState,
} from '@/lib/definitions/movie';
import { and, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';

export async function createMovieReview(
  userId: string,
  state: CreateMovieReviewFormState,
  formData: FormData
) {
  if (!userId) {
    return {
      message: 'You must be logged in to review a movie.',
    };
  }

  const validatedFields = CreateMovieReviewFormSchema.safeParse({
    movieId: Number(formData.get('movieId')),
    rating: Number(formData.get('rating')),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { movieId, rating, content } = validatedFields.data;

  const data = await db
    .insert(reviews)
    .values({
      userId,
      movieId,
      rating,
      content,
    })
    .onConflictDoNothing({ target: [reviews.userId, reviews.movieId] })
    .returning({ id: reviews.id });

  if (data.length === 0) {
    return {
      message: 'You have already reviewed this movie.',
    };
  }

  revalidateTag(`movieReviews`);
  revalidateTag(`userReviews`);
}

export async function updateMovieReview(
  userId: string,
  state: UpdateMovieReviewFormState,
  formData: FormData
) {
  if (!userId) {
    return {
      message: 'You must be logged in to update a review.',
    };
  }

  const validatedFields = UpdateMovieReviewFormSchema.safeParse({
    reviewId: formData.get('reviewId'),
    rating: Number(formData.get('rating')),
    content: formData.get('content'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { reviewId, rating, content } = validatedFields.data;

  await db
    .update(reviews)
    .set({
      rating,
      content,
    })
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)));

  revalidateTag(`movieReviews`);
  revalidateTag(`userReviews`);

  return {
    message: 'Review updated successfully.',
  };
}

export async function deleteMovieReview(userId: string, reviewId: string) {
  if (!userId) return;

  try {
    await db
      .delete(reviews)
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)))
      .returning({ id: reviews.id });
  } catch (error) {
    console.error(error);
  }

  revalidateTag(`movieReviews`);
  revalidateTag(`userReviews`);
}
