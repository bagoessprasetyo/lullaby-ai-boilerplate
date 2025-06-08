"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function LightPullThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="relative py-16 p-6 overflow-hidden cursor-grab">
            <motion.div
                drag="y"
                dragDirectionLock
                onDragEnd={(event, info) => {
                    // Trigger toggle only on a downward pull (positive y offset)
                    if (info.offset.y > 20) { // Added a threshold for pull distance
                        toggleTheme();
                    }
                }}
                dragConstraints={{ top: 0, bottom: 50 }} // Allow dragging down slightly
                dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
                dragElastic={0.075}
                whileDrag={{ cursor: "grabbing" }}
                className="relative bottom-0 w-8 h-8 rounded-full 
                bg-[radial-gradient(circle_at_center,_#facc15,_#fcd34d,_#fef9c3)] 
                dark:bg-[radial-gradient(circle_at_center,_#4b5563,_#1f2937,_#000)] 
                shadow-[0_0_20px_8px_rgba(250,204,21,0.5)] 
                dark:shadow-[0_0_20px_6px_rgba(31,41,55,0.7)] 
                transition-colors duration-300 ease-in-out" // Added transition for smoother color change
            >
                {/* The visual pull cord */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-[60px] bg-neutral-300 dark:bg-neutral-700 transition-colors duration-300 ease-in-out"></div>
            </motion.div>
            {/* Optional: Add text indication */}
            {/* <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Pull to switch</p> */}
        </div>
    );
}