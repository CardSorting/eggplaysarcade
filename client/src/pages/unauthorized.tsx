import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-8 bg-card border rounded-lg shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <ShieldOff className="h-16 w-16 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        
        <p className="text-muted-foreground">
          You don't have the required permissions to access this page. 
          If you believe this is a mistake, please contact the administrator.
        </p>
        
        <div className="pt-4 flex flex-col space-y-3">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}