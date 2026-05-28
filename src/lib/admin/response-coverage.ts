import { PERMITTED_DIRECTOR_EMAIL_SET } from "@/lib/admin/permitted-directors";
import type { WhitelistUserEnriched } from "@/lib/admin/whitelist";

interface ResponseCoverageSchool {
  rbd: string;
  schoolName: string;
  directors: string[];
}

export interface ResponseCoverageSummary {
  directorCoverage: ResponseCoverageSchool[];
  respondedSchools: ResponseCoverageSchool[];
  pendingSchools: ResponseCoverageSchool[];
  expectedDirectorCount: number;
  respondedDirectorCount: number;
  pendingDirectorCount: number;
}

export function buildResponseCoverageSummary(
  whitelistUsers: WhitelistUserEnriched[],
  trips: Array<{ rbd: string }>,
): ResponseCoverageSummary {
  const expectedDirectorProfiles = whitelistUsers.filter(
    (user) => user.rol === "director" && user.rbd && PERMITTED_DIRECTOR_EMAIL_SET.has(user.email.trim().toLowerCase()),
  );
  const directorCoverageBySchool = new Map<string, ResponseCoverageSchool>();

  for (const director of expectedDirectorProfiles) {
    const rbd = director.rbd as string;
    const currentEntry = directorCoverageBySchool.get(rbd);

    if (currentEntry) {
      currentEntry.directors.push(director.email);
      continue;
    }

    directorCoverageBySchool.set(rbd, {
      rbd,
      schoolName: director.school_name ?? `RBD ${rbd}`,
      directors: [director.email],
    });
  }

  const respondedRbds = new Set(trips.map((trip) => trip.rbd));
  const directorCoverage = Array.from(directorCoverageBySchool.values())
    .map((school) => ({
      ...school,
      directors: school.directors.sort((a, b) => a.localeCompare(b, "es")),
    }))
    .sort((a, b) => a.schoolName.localeCompare(b.schoolName, "es"));
  const respondedSchools = directorCoverage.filter((school) => respondedRbds.has(school.rbd));
  const pendingSchools = directorCoverage.filter((school) => !respondedRbds.has(school.rbd));
  const respondedDirectorCount = respondedSchools.reduce((sum, school) => sum + school.directors.length, 0);
  const pendingDirectorCount = pendingSchools.reduce((sum, school) => sum + school.directors.length, 0);

  return {
    directorCoverage,
    respondedSchools,
    pendingSchools,
    expectedDirectorCount: expectedDirectorProfiles.length,
    respondedDirectorCount,
    pendingDirectorCount,
  };
}