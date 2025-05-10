import { User } from "../types";

export function getUserName(user: User, ini: "firstName" | "lastName"): string {
    if (user.student) return user.student[ini]!;
    if (user.staff) return user.staff[ini]!;
    return ini === "firstName" ? "Administrator" : "";
}