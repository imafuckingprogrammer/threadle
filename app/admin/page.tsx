"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const [date, setDate] = useState(today());
  const [startWord, setStartWord] = useState("");
  const [endWord, setEndWord] = useState("");
  const [steps, setSteps] = useState<string[]>(["", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function addStep() {
    setSteps((s) => [...s, ""]);
  }

  function removeStep(i: number) {
    setSteps((s) => s.filter((_, idx) => idx !== i));
  }

  function updateStep(i: number, val: string) {
    setSteps((s) => s.map((v, idx) => (idx === i ? val.toUpperCase().replace(/[^A-Z]/g, "") : v)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const solution = steps.map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          date,
          startWord: startWord.trim().toUpperCase(),
          endWord: endWord.trim().toUpperCase(),
          solution,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setAuthed(false);
          setError("Wrong password.");
        } else {
          setError(data.error ?? "Something went wrong.");
        }
      } else {
        setSuccess(
          `Saved! Par is ${data.par} step${data.par !== 1 ? "s" : ""}.`
        );
        setStartWord("");
        setEndWord("");
        setSteps(["", ""]);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Password gate
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm border-border">
          <CardHeader>
            <CardTitle className="font-tile text-sm uppercase tracking-widest text-muted-foreground font-normal">
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (password.length > 0) setAuthed(true);
              }}
              className="flex flex-col gap-3"
            >
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-tile"
                autoFocus
              />
              <Button type="submit" className="w-full font-tile tracking-wide">
                Enter
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-tile text-sm uppercase tracking-widest text-foreground">
              Threadle Admin
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Add or update a daily puzzle
            </p>
          </div>
          <button
            onClick={() => {
              setAuthed(false);
              setPassword("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-tile underline underline-offset-4"
          >
            Sign out
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-tile">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-tile"
              required
            />
          </div>

          {/* Start → End */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-tile">
                Start word
              </label>
              <Input
                value={startWord}
                onChange={(e) =>
                  setStartWord(
                    e.target.value.toUpperCase().replace(/[^A-Z]/g, "")
                  )
                }
                placeholder="e.g. COLD"
                className="font-tile uppercase"
                autoComplete="off"
                spellCheck={false}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-tile">
                End word
              </label>
              <Input
                value={endWord}
                onChange={(e) =>
                  setEndWord(
                    e.target.value.toUpperCase().replace(/[^A-Z]/g, "")
                  )
                }
                placeholder="e.g. WARM"
                className="font-tile uppercase"
                autoComplete="off"
                spellCheck={false}
                required
              />
            </div>
          </div>

          {/* Solution steps */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-tile">
              Solution steps (intermediate words only)
            </label>
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-right text-xs text-muted-foreground font-tile shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}`}
                    className="font-tile uppercase flex-1"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-tile shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-1 self-start text-xs text-muted-foreground hover:text-foreground transition-colors font-tile underline underline-offset-4"
            >
              + Add step
            </button>
            <p className="text-[10px] text-muted-foreground font-tile mt-1">
              Don&apos;t include the start or end word here — just the intermediate steps.
              Par is set automatically to the number of steps.
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <p className="text-sm text-destructive font-tile">{error}</p>
          )}
          {success && (
            <p className="text-sm text-foreground font-tile">{success}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-tile tracking-wide"
          >
            {loading ? "Saving…" : "Save puzzle"}
          </Button>
        </form>
      </div>
    </main>
  );
}
