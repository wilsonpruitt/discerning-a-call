import type { FacultyMember, SeminaryProfile, StudyArea } from "./types";
import perkinsProfile from "@/data/seminaries/perkins.json";
import perkinsFaculty from "@/data/faculty/perkins.json";
import austinProfile from "@/data/seminaries/austin-presbyterian.json";
import austinFaculty from "@/data/faculty/austin-presbyterian.json";
import briteProfile from "@/data/seminaries/brite.json";
import briteFaculty from "@/data/faculty/brite.json";
import candlerProfile from "@/data/seminaries/candler.json";
import candlerFaculty from "@/data/faculty/candler.json";
import dukeProfile from "@/data/seminaries/duke.json";
import dukeFaculty from "@/data/faculty/duke.json";
import garrettProfile from "@/data/seminaries/garrett.json";
import garrettFaculty from "@/data/faculty/garrett.json";
import phillipsProfile from "@/data/seminaries/phillips.json";
import phillipsFaculty from "@/data/faculty/phillips.json";
import saintPaulProfile from "@/data/seminaries/saint-paul.json";
import saintPaulFaculty from "@/data/faculty/saint-paul.json";
import vanderbiltProfile from "@/data/seminaries/vanderbilt.json";
import vanderbiltFaculty from "@/data/faculty/vanderbilt.json";
import wesleyProfile from "@/data/seminaries/wesley.json";
import wesleyFaculty from "@/data/faculty/wesley.json";

// The harvested layer. These JSON files are machine-written and reviewed as a
// git diff — see research/seminary-pages-plan.md. Add a school by harvesting
// its two files and registering them here.

export const seminaryProfiles: SeminaryProfile[] = [
  perkinsProfile as SeminaryProfile,
  austinProfile as SeminaryProfile,
  briteProfile as SeminaryProfile,
  candlerProfile as SeminaryProfile,
  dukeProfile as SeminaryProfile,
  garrettProfile as SeminaryProfile,
  phillipsProfile as SeminaryProfile,
  saintPaulProfile as SeminaryProfile,
  vanderbiltProfile as SeminaryProfile,
  wesleyProfile as SeminaryProfile,
];

export const seminaryProfileBySlug = Object.fromEntries(
  seminaryProfiles.map((p) => [p.slug, p]),
) as Record<string, SeminaryProfile | undefined>;

export const faculty: FacultyMember[] = [
  ...(perkinsFaculty as FacultyMember[]),
  ...(austinFaculty as FacultyMember[]),
  ...(briteFaculty as FacultyMember[]),
  ...(candlerFaculty as FacultyMember[]),
  ...(dukeFaculty as FacultyMember[]),
  ...(garrettFaculty as FacultyMember[]),
  ...(phillipsFaculty as FacultyMember[]),
  ...(saintPaulFaculty as FacultyMember[]),
  ...(vanderbiltFaculty as FacultyMember[]),
  ...(wesleyFaculty as FacultyMember[]),
];

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
