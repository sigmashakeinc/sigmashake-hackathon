"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useHackathon } from "@/core/hackathon";
import { Input, Button } from "@/components/ui";

export default function EditHackathonPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { update } = useHackathon();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [website, setWebsite] = useState("");
  const [devpostUrl, setDevpostUrl] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { getSupabaseServerClient: getClient } =
          await import("@/services/supabase");
        const supabase = getClient();
        const { data } = await supabase
          .from("hackathons")
          .select("*")
          .eq("id", id)
          .single();

        const row = data as Record<string, unknown> | null;
        if (row) {
          setName(String(row.name ?? ""));
          setOrganizer(String(row.organizer ?? ""));
          setLocation(String(row.location ?? ""));
          setStartDate(String(row.start_date ?? ""));
          setEndDate(String(row.end_date ?? ""));
          setSubmissionDeadline(String(row.submission_deadline ?? ""));
          setTimezone(String(row.timezone ?? "UTC"));
          setWebsite(String(row.website ?? ""));
          setDevpostUrl(String(row.devpost_url ?? ""));
          setDescription(String(row.description ?? ""));
        }
      } catch {
        setError("Failed to load hackathon.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await update(id, {
        name: name.trim() || undefined,
        organizer: organizer.trim() || undefined,
        location: location.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        submissionDeadline: submissionDeadline || undefined,
        timezone,
        website: website.trim() || undefined,
        devpostUrl: devpostUrl.trim() || undefined,
        description: description.trim() || undefined,
      });
      router.replace("/app");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update hackathon.",
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="gap-sm flex items-center">
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg mx-auto max-w-2xl">
      <div className="mb-lg">
        <Link
          href="/app"
          className="text-primary font-mono text-[10px] transition-opacity hover:opacity-80"
        >
          ← Back to Overview
        </Link>
        <h1 className="mt-sm text-h1 text-on-surface font-semibold">
          Edit Hackathon
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="gap-lg flex flex-col">
        <div className="border-outline-variant/30 bg-surface-container p-lg rounded border">
          <h2 className="mb-md text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
            Basic Information
          </h2>
          <div className="gap-md flex flex-col">
            <Input
              label="Hackathon Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="gap-md grid grid-cols-1 sm:grid-cols-2">
              <Input
                label="Organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="border-outline-variant/30 bg-surface-container p-lg rounded border">
          <h2 className="mb-md text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
            Dates & Time
          </h2>
          <div className="gap-md grid grid-cols-1 sm:grid-cols-2">
            <Input
              label="Start Date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              label="Submission Deadline"
              type="datetime-local"
              value={submissionDeadline}
              onChange={(e) => setSubmissionDeadline(e.target.value)}
            />
            <Input
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
        </div>

        <div className="border-outline-variant/30 bg-surface-container p-lg rounded border">
          <h2 className="mb-md text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
            Links
          </h2>
          <div className="gap-md grid grid-cols-1 sm:grid-cols-2">
            <Input
              label="Website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Input
              label="Devpost URL"
              type="url"
              value={devpostUrl}
              onChange={(e) => setDevpostUrl(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="border-error-container/30 bg-error-container/5 px-sm py-xs text-error rounded border font-mono text-[10px]"
          >
            {error}
          </p>
        )}

        <div className="gap-sm flex items-center justify-end">
          <Link
            href="/app"
            className="border-outline-variant px-md py-sm text-body-sm text-on-surface hover:border-on-surface inline-flex items-center justify-center rounded border bg-black transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
