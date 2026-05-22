export function getSubmissionFailureMessage(error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown operational error.";

  if (/network|unable to reach|backend|cors/i.test(detail)) {
    return {
      title: "Incident service unavailable",
      detail: "The reporting channel could not reach the backend. Confirm the FastAPI service is running."
    };
  }

  if (/upload/i.test(detail)) {
    return {
      title: "Evidence upload failed",
      detail: "The media file could not be stored. Please retry with a smaller image or recheck the backend service."
    };
  }

  if (/image|render/i.test(detail)) {
    return {
      title: "Image preview unavailable",
      detail: "The evidence asset could not be rendered, but the rest of the report remains available."
    };
  }

  if (/moderation|verify|resolve|escalate|reject/i.test(detail)) {
    return {
      title: "Moderation update failed",
      detail: "The incident lifecycle change was not saved. Please retry the action."
    };
  }

  return {
    title: "Operational request failed",
    detail
  };
}
