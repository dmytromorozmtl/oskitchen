import {
  CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS,
  type CaseStudyPipelineP256Stage,
} from "@/lib/marketing/case-study-template-pipeline-p2-56-policy";

export type CaseStudyPipelineInput = {
  loiSignedDate: string | null;
  pilotStartDate: string | null;
  customerApproval: "none" | "anonymized_signed" | "signed";
  publishGatesPassed: boolean;
  asOf?: Date;
};

export type CaseStudyPipelineResolution = {
  stage: CaseStudyPipelineP256Stage;
  publishReviewEligible: boolean;
  publishReviewDate: string | null;
  daysUntilPublishReview: number | null;
  recommendedTemplate: string;
};

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computePublishReviewDate(pilotStartDate: string): string {
  const start = parseDateOnly(pilotStartDate);
  const review = new Date(start);
  review.setUTCDate(review.getUTCDate() + CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS);
  return formatDateOnly(review);
}

export function resolveCaseStudyPipelineStage(
  input: CaseStudyPipelineInput,
): CaseStudyPipelineResolution {
  const asOf = input.asOf ?? new Date();
  const asOfDate = formatDateOnly(asOf);

  if (input.publishGatesPassed && input.customerApproval !== "none") {
    return {
      stage: "published_post_gates",
      publishReviewEligible: true,
      publishReviewDate: input.pilotStartDate
        ? computePublishReviewDate(input.pilotStartDate)
        : null,
      daysUntilPublishReview: 0,
      recommendedTemplate: "lib/marketing/case-studies.ts",
    };
  }

  if (input.pilotStartDate) {
    const publishReviewDate = computePublishReviewDate(input.pilotStartDate);
    const publishReviewEligible = asOfDate >= publishReviewDate;

    if (publishReviewEligible) {
      return {
        stage: "pilot_day_30_publish_review",
        publishReviewEligible: true,
        publishReviewDate,
        daysUntilPublishReview: 0,
        recommendedTemplate: "docs/case-study-template.md",
      };
    }

    const start = parseDateOnly(input.pilotStartDate);
    const review = parseDateOnly(publishReviewDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysUntilPublishReview = Math.max(
      0,
      Math.ceil((review.getTime() - asOf.getTime()) / msPerDay),
    );

    if (asOfDate >= input.pilotStartDate) {
      return {
        stage: "pilot_active_w1",
        publishReviewEligible: false,
        publishReviewDate,
        daysUntilPublishReview,
        recommendedTemplate: "docs/case-studies/_MILESTONE_TEMPLATE.md",
      };
    }
  }

  if (input.loiSignedDate) {
    return {
      stage: "loi_signed_internal_draft",
      publishReviewEligible: false,
      publishReviewDate: input.pilotStartDate
        ? computePublishReviewDate(input.pilotStartDate)
        : null,
      daysUntilPublishReview: input.pilotStartDate
        ? Math.max(
            0,
            Math.ceil(
              (parseDateOnly(computePublishReviewDate(input.pilotStartDate)).getTime() -
                asOf.getTime()) /
                (24 * 60 * 60 * 1000),
            ),
          )
        : null,
      recommendedTemplate: "docs/case-studies/_MILESTONE_TEMPLATE.md",
    };
  }

  return {
    stage: "pre_loi_template",
    publishReviewEligible: false,
    publishReviewDate: null,
    daysUntilPublishReview: null,
    recommendedTemplate: "docs/case-study-template-pre-pilot.md",
  };
}
