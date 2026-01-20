'use client';

import { useUser } from '@/components/auth/user-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePassword } from '@/lib/actions/auth';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { startTransition, useActionState, useState } from 'react';

export default function UpdatePasswordForm() {
  const user = useUser();
  const updatePasswordWithId = updatePassword.bind(null, user?.id ?? '');

  const [state, action, pending] = useActionState(
    updatePasswordWithId,
    undefined
  );

  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);

  const toggleCurrentVisibility = () => setIsCurrentVisible(!isCurrentVisible);
  const toggleNewVisibility = () => setIsNewVisible(!isNewVisible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => action(new FormData(e.target as HTMLFormElement)));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!user && (
        <div>
          <p className="text-sm text-muted-foreground">
            You must be logged in to update your password.
          </p>
          <Link href="/login">
            <Button className="mt-3" type="button">
              Go to login
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="currentPassword">Current password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            name="currentPassword"
            className="pe-9"
            placeholder="Enter your password"
            type={isCurrentVisible ? 'text' : 'password'}
          />
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleCurrentVisibility}
            aria-label={isCurrentVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isCurrentVisible}
            aria-controls="currentPassword"
          >
            {isCurrentVisible ? (
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        {state?.errors?.currentPassword && (
          <p className="text-sm text-destructive">
            {state.errors.currentPassword[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="newPassword">New password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            className="pe-9"
            placeholder="Enter your password"
            type={isNewVisible ? 'text' : 'password'}
          />
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleNewVisibility}
            aria-label={isNewVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isNewVisible}
            aria-controls="newPassword"
          >
            {isNewVisible ? (
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        {state?.errors?.newPassword && (
          <div>
            <p className="text-sm text-destructive">Password must:</p>
            <ul>
              {state.errors.newPassword.map((error) => (
                <li key={error} className="text-sm text-destructive">
                  &bull; {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button type="submit" disabled={pending || !user}>
        {pending ? <Loader2 className="animate-spin" /> : <Lock />}
        <span>Save changes</span>
      </Button>

      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
