import { SettingContext } from "@/contexts/SettingContext";
import { useContext } from "react";

export const useSettings = () => {
    const context = useContext(SettingContext);
    if (!context) {
        throw new Error("use settings context must be wrapped in SettingProvider")
    }
    return context;
}