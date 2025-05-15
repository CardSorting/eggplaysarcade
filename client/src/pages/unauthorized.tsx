import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full px-6 py-12 bg-card shadow-lg rounded-lg text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Unauthorized Access</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. If you believe this is an
          error, please contact the administrator.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}