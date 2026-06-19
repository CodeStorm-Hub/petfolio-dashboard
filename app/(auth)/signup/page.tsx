import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your vendor account</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
