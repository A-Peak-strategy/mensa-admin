'use client';

import React, { useState } from 'react';
import { Card, type SxProps } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
    children: React.ReactNode;
    sx?: SxProps;
    delay?: number;
    hoverScale?: number;
    hoverLift?: number;
}

const MotionCard = motion(Card);

/**
 * Card component with entrance animation and hover effects.
 * Uses Framer Motion for smooth animations.
 */
export function AnimatedCard({
    children,
    sx,
    delay = 0,
    hoverScale = 1.02,
    hoverLift = -4,
}: AnimatedCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            whileHover={{
                scale: hoverScale,
                y: hoverLift,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            sx={{
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease',
                ...sx,
            }}
        >
            {children}
        </MotionCard>
    );
}

/**
 * Stagger animation container for multiple cards.
 */
export function AnimatedCardGrid({
    children,
    staggerDelay = 0.1,
}: {
    children: React.ReactNode;
    staggerDelay?: number;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            style={{ display: 'contents' }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Motion variant for grid children.
 */
export const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};
