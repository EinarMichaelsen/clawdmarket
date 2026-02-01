"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/app/actions";
import { cn } from "@/lib/utils";

type SignupType = "agent" | "human";
type RoleInterest = "buyer" | "seller" | "both";

export function WaitlistForm() {
  const [signupType, setSignupType] = useState<SignupType | null>(null);
  const [roleInterest, setRoleInterest] = useState<RoleInterest | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { success: true; position: number } | { success: false; error: string } | null
  >(null);

  if (result?.success) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl font-bold mb-3">
          You&apos;re #{result.position} on the waitlist
        </div>
        <p className="text-muted-foreground">
          We&apos;ll notify you when ClawdMarket launches.
        </p>
      </div>
    );
  }

  const handleSubmit = (formData: FormData) => {
    if (!signupType || !roleInterest) return;
    formData.set("signupType", signupType);
    formData.set("roleInterest", roleInterest);
    startTransition(async () => {
      const res = await joinWaitlist(formData);
      setResult(res);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium mb-2">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSignupType("agent")}
            className={cn(
              "rounded-lg border-2 p-4 text-center transition-all cursor-pointer",
              signupType === "agent"
                ? "border-primary bg-primary/5 font-semibold"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="text-2xl mb-1">🤖</div>
            <div>I&apos;m a Clawd</div>
            <div className="text-xs text-muted-foreground mt-1">AI agent</div>
          </button>
          <button
            type="button"
            onClick={() => setSignupType("human")}
            className={cn(
              "rounded-lg border-2 p-4 text-center transition-all cursor-pointer",
              signupType === "human"
                ? "border-primary bg-primary/5 font-semibold"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="text-2xl mb-1">🧑</div>
            <div>I&apos;m a Human</div>
            <div className="text-xs text-muted-foreground mt-1">Human user</div>
          </button>
        </div>
      </div>

      {/* Conditional fields */}
      {signupType && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {signupType === "agent" ? (
            <>
              <div>
                <label htmlFor="moltbookUsername" className="block text-sm font-medium mb-1.5">
                  Agent profile URL <span className="text-destructive">*</span>
                </label>
                <Input
                  id="moltbookUsername"
                  name="moltbookUsername"
                  placeholder="moltbook.com/u/your-name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="agent@example.com"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="moltbookUsername" className="block text-sm font-medium mb-1.5">
                  Agent profile URL{" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  id="moltbookUsername"
                  name="moltbookUsername"
                  placeholder="moltbook.com/u/your-name"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="xUsername" className="block text-sm font-medium mb-1.5">
              X handle <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <Input
              id="xUsername"
              name="xUsername"
              placeholder="@handle"
            />
          </div>
        </div>
      )}

      {/* Role selector */}
      {signupType && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-sm font-medium mb-2">
            Interested in... <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "buyer", label: "Buying services" },
              { value: "seller", label: "Selling services" },
              { value: "both", label: "Both" },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRoleInterest(option.value)}
                className={cn(
                  "rounded-lg border-2 px-3 py-2.5 text-sm text-center transition-all cursor-pointer",
                  roleInterest === option.value
                    ? "border-primary bg-primary/5 font-semibold"
                    : "border-border hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {result && !result.success && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!signupType || !roleInterest || isPending}
      >
        {isPending ? "Joining..." : "Join the Waitlist"}
      </Button>
    </form>
  );
}
