"use client";

import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Clock,
    Star,
    TrendingUp,
    Video,
    Globe,
    BookOpenIcon,
    HeadphonesIcon,
    BadgeCheckIcon,
} from "lucide-react";

export interface BentoItem {
    title: string;
    description: string | React.ReactNode;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    rowSpan?: number; // Added for potential vertical spanning
    hasPersistentHover?: boolean;
    background?: React.ReactNode; // Allow custom background elements
    className?: string; // Allow custom class names per item
}

interface BentoGridProps {
    items: BentoItem[];
    className?: string; // Allow custom class names for the grid container
}


function BentoGrid({ items, className }: BentoGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]", // Adjusted grid layout and row height
                className
            )}
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative flex flex-col justify-between p-4 rounded-xl overflow-hidden transition-all duration-300",
                        "border border-gray-100/80 dark:border-white/10 bg-card dark:bg-card", // Use theme-aware background
                        "hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-neutral-800/50",
                        "hover:-translate-y-0.5 will-change-transform",
                        item.colSpan ? `md:col-span-${item.colSpan}` : "md:col-span-1",
                        item.rowSpan ? `md:row-span-${item.rowSpan}` : "md:row-span-1",
                        {
                            "shadow-md -translate-y-0.5": item.hasPersistentHover,
                            "dark:shadow-lg dark:shadow-neutral-800/50": item.hasPersistentHover,
                        },
                        item.className
                    )}
                >
                    {/* Optional Background Element */}
                    {item.background}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col space-y-2 flex-grow">
                        <div className="flex items-center justify-between">
                            {item.icon && (
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-gradient-to-br transition-all duration-300">
                                    {item.icon}
                                </div>
                            )}
                            {item.status && (
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm",
                                        "bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                                        "transition-colors duration-300 group-hover:bg-black/10 dark:group-hover:bg-white/20"
                                    )}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1 flex-grow">
                            <h3 className="font-medium text-slate-600 dark:text-card-foreground group-hover:text-white tracking-tight text-base transition-colors duration-300">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-muted-foreground dark:text-muted-foreground font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <div className="text-sm text-muted-foreground dark:text-muted-foreground group-hover:text-white leading-snug font-[425] transition-colors duration-300">
                                {item.description}
                            </div>
                        </div>
                    </div>

                    {/* Footer/CTA */}
                    <div className="relative z-10 flex items-center justify-between mt-2">
                        {item.tags && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground dark:text-muted-foreground">
                                {item.tags?.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        {item.cta && (
                            <span className="text-xs text-primary dark:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.cta || "Explore →"}
                            </span>
                        )}
                    </div>

                    {/* Optional Hover Gradient Border */}
                    <div
                        className={cn(
                            `absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10`,
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100",
                            "transition-opacity duration-300"
                        )}
                    />
                </div>
            ))}
        </div>
    );
}

export { BentoGrid };