import { AcademicSession } from '@/types';
import { Option } from '@/components/ui/ReSelect'; // Assuming Option type is exported from ReSelect or defined in types

/**
 * Filters academic sessions to show only those from the student's enrollment year onwards.
 * An academic session "YYYY1/YYYY2" is considered relevant if its ending year (YYYY2)
 * is greater than or equal to the student's enrollment year.
 *
 * @param studentEnrollmentDate The student's enrollment date (e.g., from student.createdAt).
 * @param allAcademicSessions An array of all academic sessions.
 * @param currentAcademicSessionId The ID of the current academic session to mark it in the label.
 * @returns An array of Option objects for the select dropdown.
 */
export const getFilteredSessionOptions = (
    studentEnrollmentDate: Date | string | undefined,
    allAcademicSessions: AcademicSession[] | undefined,
    currentAcademicSessionId: number | null | undefined
): Option[] => {
    if (!studentEnrollmentDate || !allAcademicSessions || allAcademicSessions.length === 0) {
        return [];
    }

    const enrollmentDate = new Date(studentEnrollmentDate);
    const enrollmentYear = enrollmentDate.getFullYear();

    // Sort sessions chronologically by name (assuming 'YYYY1/YYYY2' format)
    const sortedSessions = [...allAcademicSessions].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    const displayableSessions = sortedSessions.filter((session) => {
        const yearParts = session.name.split('/');
        // Assuming the second part is the ending year, or if only one year, that's the year.
        const sessionEndingYear = parseInt(yearParts[yearParts.length - 2], 10);
        return sessionEndingYear >= enrollmentYear;
    });

    return displayableSessions.map((session) => {
        let label = session.name;
        if (session.id.toString() === currentAcademicSessionId?.toString()) {
            label = `${label} (Current)`;
        }
        return {
            value: session.id.toString(),
            label,
        };
    });
};