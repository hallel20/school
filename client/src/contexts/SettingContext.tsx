import useFetch from "@/hooks/useFetch";
import { SchoolSetting } from "@/types";
import { createContext } from "react";

interface SettingContextType {
    settings: SchoolSetting | undefined
}

const SettingContext = createContext<SettingContextType | null>(null);


interface SettingProviderProps {
    children: React.ReactNode;
}

const SettingProvider = ({ children }: SettingProviderProps) => {
    const { data: settings } = useFetch<SchoolSetting>("/settings")

    return (
        <SettingContext.Provider value={{ settings }}>
            {children}
        </SettingContext.Provider>
    )
}

export { SettingProvider, SettingContext };