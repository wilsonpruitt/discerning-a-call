import type { FacultyMember, SeminaryProfile, StudyArea } from "./types";
import perkinsProfile from "@/data/seminaries/perkins.json";
import perkinsFaculty from "@/data/faculty/perkins.json";

// The harvested layer. These JSON files are machine-written and reviewed as a
// git diff — see research/seminary-pages-plan.md. Add a school by harvesting
// its two files and registering them here.

export const seminaryProfiles: SeminaryProfile[] = [perkinsProfile as SeminaryProfile];

export const seminaryProfileBySlug = Object.fromEntries(
  seminaryProfiles.map((p) => [p.slug, p]),
) as Record<string, SeminaryProfile | undefined>;

export const faculty: FacultyMember[] = [...(perkinsFaculty as FacultyMember[])];

export function facultyBySeminary(slug: string): FacultyMember[] {
  return faculty.filter((f) => f.seminarySlug === slug);
}

// Group a roster by our normalized vocabulary. A person with three areas shows
// up under all three — that is the point, not a bug.
export function groupByArea(members: FacultyMember[]): Map<StudyArea, FacultyMember[]> {
  const map = new Map<StudyArea, FacultyMember[]>();
  for (const m of members) {
    for (const area of m.areas) {
      const list = map.get(area) ?? [];
      list.push(m);
      map.set(area, list);
    }
  }
  return new Map([...map.entries()].sort((a, b) => b[1].length - a[1].length));
}
