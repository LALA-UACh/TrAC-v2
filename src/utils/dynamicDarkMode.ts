import dynamic from "next/dynamic";

export const DarkMode = dynamic(() => import("../components/DarkMode"), {
  ssr: false,
});
