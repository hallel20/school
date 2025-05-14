import { User } from "../types";

export function getUserName(user: User, ini: "firstName" | "lastName"): string {
    if (user.student) return user.student[ini]!;
    if (user.staff) return user.staff[ini]!;
    return ini === "firstName" ? "Administrator" : "";
}

export function camelCaseToSentence(camelCase: string): string {
    const result = camelCase.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
}

export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
