import dynamic from "next/dynamic";

export const DarkMode = dynamic(() => import("./darkMode"), { ssr: false });
