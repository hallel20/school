import { year } from "@prisma/client";

export const padToTenThousands = (num: number) => {
  return num.toString().padStart(5, "0");
};

// Mapping from year index (0-based) to Prisma year enum
const yearIndexToEnum: Record<number, year> = {
  0: 'first',
  1: 'second',
  2: 'third',
  3: 'fourth',
  4: 'fifth',
  // Add more if your program has more than 5 years
};

/**
 * Calculates a student's year level for a specific academic session.
 * Assumes academic sessions are chronologically sortable by their 'name' (e.g., "YYYY/YYYY").
 *
 * @param studentEnrollmentDate The student's enrollment date (typically Student.createdAt).
 * @param targetAcademicSessionId The ID of the academic session for which to calculate the year level.
 * @param allAcademicSessions A list of all academic sessions, including their IDs and names.
 * @returns The calculated year level enum ('first', 'second', etc.) or undefined if the session is before enrollment or beyond defined years.
 */
export const getStudentYearLevelForSession = (
  studentEnrollmentDate: Date,
  targetAcademicSessionId: number,
  allAcademicSessions: { id: number; name: string }[]
): year | undefined => {
  // Sort sessions chronologically by name
  const sortedSessions = [...allAcademicSessions].sort((a, b) => a.name.localeCompare(b.name));

  const enrollmentYear = studentEnrollmentDate.getFullYear();
  const enrollmentSessionIndex = sortedSessions.findIndex(session => session.name.includes(enrollmentYear.toString())); // Simple check
  const targetSessionIndex = sortedSessions.findIndex(session => session.id === targetAcademicSessionId);

  if (enrollmentSessionIndex === -1 || targetSessionIndex === -1 || targetSessionIndex < enrollmentSessionIndex) {
    return undefined; // Enrollment session not found, target session not found, or target session is before enrollment
  }

  const yearLevelIndex = targetSessionIndex - enrollmentSessionIndex;
  return yearIndexToEnum[yearLevelIndex - 1];
};
