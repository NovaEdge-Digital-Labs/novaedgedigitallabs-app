"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    isPositive?: boolean;
    icon: LucideIcon;
    color: string;
    index: number;
}

export function StatCard({
    title,
    value,
    change,
    isPositive,
    icon: Icon,
    color,
    index
}: StatCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 20, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "back.out(1.7)"
                }
            );
        }
    }, [index]);

    return (
        <div
            ref={cardRef}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors"
        >
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
                color === "blue" ? "bg-blue-500" :
                    color === "purple" ? "bg-purple-500" :
                        color === "green" ? "bg-green-500" : "bg-orange-500"
            )} />

            <div className="flex items-center justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                    color === "blue" ? "bg-blue-500/10 text-blue-500" :
                        color === "purple" ? "bg-purple-500/10 text-purple-500" :
                            color === "green" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                )}>
                    <Icon className="w-6 h-6" />
                </div>

                {change && (
                    <div className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {isPositive ? "+" : ""}{change}
                    </div>
                )}
            </div>

            <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
