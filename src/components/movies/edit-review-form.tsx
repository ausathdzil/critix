'use client';

import { useUser } from '@/components/auth/user-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateMovieReview } from '@/lib/actions/movie';
import { ArrowLeft, Loader2, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useActionState } from 'react';

export default function EditReviewForm({
  reviewId,
  rating,
  content,
}: {
  reviewId: string;
  rating: number;
  content: string;
}) {
  const user = useUser();
  if (!user) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          You must be logged in to edit a review.
        </p>
        <Link href="/login">
          <Button className="mt-3">Go to login</Button>
        </Link>
      </div>
    );
  }
  const updateMovieReviewWithId = updateMovieReview.bind(null, user.id);

  const [state, action, pending] = useActionState(
    updateMovieReviewWithId,
    undefined
  );

  const { back } = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => action(new FormData(event.currentTarget)));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input type="hidden" name="reviewId" value={reviewId} />

      <div className="space-y-1">
        <Label htmlFor="rating">Rating</Label>
        <Select defaultValue={rating.toString()} name="rating">
          <SelectTrigger>
            <SelectValue placeholder="Select a rating" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem
                value={(i + 1).toString()}
                className="tabular-nums"
                key={i}
              >
                ⭐ {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.rating && (
          <p className="text-destructive text-sm">{state.errors.rating[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="content">Review</Label>
        <Textarea
          placeholder="What did you think of the movie?"
          defaultValue={content}
          name="content"
          id="content"
        />
        {state?.errors?.content && (
          <p className="text-destructive text-sm">{state.errors.content[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-primary">{state.message}</p>}

      <div className="flex justify-end gap-4">
        <Button onClick={() => back()} variant="outline">
          <ArrowLeft />
          <span>Cancel</span>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <NotebookPen />}
          <span>Submit</span>
        </Button>
      </div>
    </form>
  );
}
