"use client";
import { motion } from "framer-motion";
import React from "react";

interface CircularProgressProps
  extends Omit<React.SVGProps<SVGSVGElement>, "viewBox"> {
  value: number;
  gradient?: {
    startColor: string;
    endColor: string;
  };
}
export function CircularProgress({
  value,
  fill = "none",
  gradient,
  ...props
}: CircularProgressProps) {
  return (
    <svg viewBox="0 0 100 100" fill={fill} {...props}>
      <circle
        cx="50"
        cy="50"
        r="45%"
        fill="transparent"
        className="stroke-muted"
        strokeWidth="10"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="45%"
        fill="transparent"
        stroke="url(#paint0_linear_62_1156)"
        strokeWidth="10"
        strokeDasharray="100"
        pathLength={100}
        strokeLinecap="round"
        initial={{ strokeDashoffset: 100 }}
        animate={{ strokeDashoffset: 100 - Math.min(value, 100) }}
        strokeDashoffset={100 - value}
      ></motion.circle>
      {gradient && (
        <defs>
          <linearGradient
            id="paint0_linear_62_1156"
            x2="100"
            y2="50"
            x1="0"
            y1="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={gradient.startColor} />
            <stop offset="1" stopColor={gradient.endColor} />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
