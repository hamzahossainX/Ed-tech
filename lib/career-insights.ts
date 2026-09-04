import { z } from "zod";

export const careerInsightsSchema = z.object({
  marketDemand: z.string().trim().min(2).max(100),
  entrySalary: z.string().trim().min(2).max(100),
  topRoles: z.array(z.string().trim().min(2).max(80)).min(1).max(4),
});

export type CareerInsights = z.infer<typeof careerInsightsSchema>;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function createCareerInsightsQuery(insights: CareerInsights) {
  const searchParams = new URLSearchParams();
  searchParams.set("ciDemand", insights.marketDemand);
  searchParams.set("ciSalary", insights.entrySalary);
  for (const role of insights.topRoles) searchParams.append("ciRole", role);
  return searchParams.toString();
}

export function parseCareerInsightsQuery(searchParams: SearchParamsRecord) {
  const rolesValue = searchParams.ciRole;
  const candidate = {
    marketDemand: Array.isArray(searchParams.ciDemand)
      ? searchParams.ciDemand[0]
      : searchParams.ciDemand,
    entrySalary: Array.isArray(searchParams.ciSalary)
      ? searchParams.ciSalary[0]
      : searchParams.ciSalary,
    topRoles: Array.isArray(rolesValue)
      ? rolesValue
      : rolesValue
        ? [rolesValue]
        : [],
  };

  const parsed = careerInsightsSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
