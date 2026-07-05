"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHackathon } from "@/core/hackathon";
import { Input, Button } from "@/components/ui";

export default function NewHackathonPage() {
  const router = useRouter();
  const { create } = useHackathon();
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

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Hackathon name is required.";
    if (!organizer.trim()) errors.organizer = "Organizer is required.";

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errors.endDate = "End date must be after start date.";
    }

    if (
      startDate &&
      submissionDeadline &&
      new Date(submissionDeadline) < new Date(startDate)
    ) {
      errors.submissionDeadline =
        "Submission deadline must be after start date.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await create({
        name: name.trim(),
        organizer: organizer.trim(),
        location: location.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        submissionDeadline: submissionDeadline || undefined,
        timezone,
        website: website.trim() || undefined,
        devpostUrl: devpostUrl.trim() || undefined,
        description: description.trim() || undefined,
        status: "active",
      });
      router.replace("/app");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create hackathon.",
      );
      setIsSubmitting(false);
    }
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
          Create Hackathon
        </h1>
        <p className="mt-xs text-on-surface-variant font-mono text-[11px]">
          Set up a new hackathon for your team to collaborate on.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="gap-lg flex flex-col">
        <div className="border-outline-variant/30 bg-surface-container p-lg rounded border">
          <h2 className="mb-md text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
            Basic Information
          </h2>
          <div className="gap-md flex flex-col">
            <Input
              label="Hackathon Name"
              placeholder="e.g. ETHGlobal Lisbon 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={validationErrors.name}
              required
            />
            <div className="gap-md grid grid-cols-1 sm:grid-cols-2">
              <Input
                label="Organizer"
                placeholder="e.g. ETHGlobal"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                error={validationErrors.organizer}
                required
              />
              <Input
                label="Location"
                placeholder="e.g. Lisbon, Portugal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Input
              label="Description"
              placeholder="A brief description of the hackathon..."
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
              error={validationErrors.endDate}
            />
            <Input
              label="Submission Deadline"
              type="datetime-local"
              value={submissionDeadline}
              onChange={(e) => setSubmissionDeadline(e.target.value)}
              error={validationErrors.submissionDeadline}
            />
            <Input
              label="Timezone"
              placeholder="UTC"
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
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Input
              label="Devpost URL"
              type="url"
              placeholder="https://devpost.com/..."
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
            {isSubmitting ? "Creating..." : "Create Hackathon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
