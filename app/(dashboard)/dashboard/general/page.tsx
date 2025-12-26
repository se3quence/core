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
import { toast } from "@/lib/toast";

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
      toast.error("File too large", {
        description: "Maximum file size is 2MB. Please choose a smaller image.",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select an image file (JPG, PNG, GIF, or WEBP).",
      });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading profile picture...");

    try {
      // Get presigned URL
      const presignRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, fileName: file.name }),
      });

      if (!presignRes.ok) {
        const error = await presignRes.json().catch(() => ({}));
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();
      if (!uploadUrl || !publicUrl) {
        throw new Error("Invalid response from server");
      }

      // Upload to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      // Update database
      const updateRes = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl }),
      });

      if (!updateRes.ok) {
        const error = await updateRes.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update profile picture");
      }

      await mutate();
      toast.success("Profile picture updated", {
        id: toastId,
        description: "Your profile picture has been successfully updated.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error("Upload failed", {
        id: toastId,
        description: err instanceof Error ? err.message : "Please try again later.",
      });
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
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Change Photo
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, GIF or WEBP. Max 2MB.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
