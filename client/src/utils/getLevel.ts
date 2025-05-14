import { Student } from "@/types";

export const getLevel = (student: Student) => {
  if (student.levelYear === "first") {
    return "100L";
  } else if (student.levelYear === "second") {
    return "200L";
  } else if (student.levelYear === "third") {
    return "300L";
  } else if (student.levelYear === "fourth") {
    return "400L";
  } else if (student.levelYear === "fifth") {
    return "500L";
  } else {
    return "600L";
  }
}