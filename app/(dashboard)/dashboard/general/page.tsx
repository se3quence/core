"use client";

import { useActionState, useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, User as UserIcon } from "lucide-react";
import { updateAccount } from "@/app/(login)/actions";
import { User } from "@/lib/db/schema";
import useSWR from "swr";
import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  name?: string;
  error?: string;
  success?: string;
};

function AccountForm({
  state,
  user,
  mutate,
}: {
  state: ActionState;
  user?: User;
  mutate: any;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Max 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get Presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, fileName: file.name }),
      });
      const { uploadUrl, publicUrl } = await res.json();

      // 2. PUT directly to R2
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 3. Update DB
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl }),
      });

      // 4. Refresh UI
      await mutate();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-4 pb-6 border-b">
        <Avatar className="w-24 h-24 border">
          <AvatarImage
            src={user?.profilePictureUrl || ""}
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-50">
            <UserIcon className="w-12 h-12 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-2">
          <Label className="text-sm font-semibold">Profile Picture</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Change Photo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Account Info Fields - Note the use of key to force re-render when user loads */}
      <div
        className="grid gap-4"
        key={user?.id}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            defaultValue={state.name || user?.name || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
          />
        </div>
      </div>
    </div>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user, mutate } = useSWR<User>("/api/user", fetcher);
  return (
    <AccountForm
      state={state}
      user={user}
      mutate={mutate}
    />
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        General Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            className="space-y-6"
          >
            <Suspense
              fallback={
                <div className="h-40 animate-pulse bg-gray-100 rounded-lg" />
              }
            >
              <AccountFormWithData state={state} />
            </Suspense>

            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm">{state.success}</p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              variant="default"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
