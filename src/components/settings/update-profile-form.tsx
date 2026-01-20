'use client';

import { useUser } from '@/components/auth/user-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@/lib/actions/auth';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { startTransition, useActionState } from 'react';

export default function UpdateProfileForm() {
  const user = useUser();
  if (!user) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          You must be logged in to update your profile.
        </p>
        <Link href="/login">
          <Button className="mt-3">Go to login</Button>
        </Link>
      </div>
    );
  }
  const updateProfileWithId = updateProfile.bind(null, user.id);

  const [state, action, pending] = useActionState(
    updateProfileWithId,
    undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => action(new FormData(e.target as HTMLFormElement)));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" defaultValue={user.name} />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" defaultValue={user.email} />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />}
        <span>Save changes</span>
      </Button>

      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
