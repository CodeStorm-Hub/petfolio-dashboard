import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Not authorized</h1>
      <p className="text-muted-foreground">
        Your account doesn&apos;t have access to this section.
      </p>
      <Button nativeButton={false} render={<Link href="/login">Back to login</Link>} />
    </div>
  );
}
