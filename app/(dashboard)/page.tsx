import { redirect } from "next/navigation";

export default function HomePage() {
  // This will trigger an immediate redirect to /sign-in
  redirect("/sign-in");

  // This part will never actually render
  return null;
}
