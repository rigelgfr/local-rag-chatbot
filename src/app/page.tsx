"use client";

import LoginPage from "@/components/login/LoginPage";
import ChatPage from "@/components/main/ChatPage";
import { authClient } from "@/lib/auth-client";
import { Loading } from "@/components/custom-ui/Loading";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Page() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      let message = "Authentication failed. Please try again.";

      if (errorDescription) {
        if (errorDescription.includes("AADSTS50194")) {
          message = "Please use an ALVA company account to sign in.";
        } else if (errorDescription.includes("AADSTS50020")) {
          message =
            "Your account is not authorized to access this application.";
        } else if (errorDescription.includes("AADSTS65001")) {
          message =
            "The application is not configured properly. Please contact support.";
        } else if (errorDescription.includes("AADSTS50011")) {
          message =
            "Invalid redirect URL configuration. Please contact support.";
        } else if (errorDescription.includes("AADSTS90014")) {
          message = "Required field is missing. Please try again.";
        } else if (errorDescription.includes("multi-tenant")) {
          message = "Please use your company email address to sign in.";
        } else if (errorDescription.includes("tenant-specific")) {
          message =
            "Only company accounts are allowed. Please use your work email.";
        } else if (errorDescription.includes("cancelled")) {
          message = "Sign in was cancelled.";
        } else if (errorDescription.includes("consent")) {
          message = "Please accept the permissions to continue.";
        }
      }

      console.log("Error details:", { error, errorDescription, message });
      toast.error(message);

      setTimeout(() => {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 100);
    }
  }, []);

  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <ChatPage />;
}
