'use client';

import React from 'react';
import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Card, CardHeader, Stack } from '@mui/material';

interface TableSkeletonProps {
    columns?: number;
    rows?: number;
    showHeader?: boolean;
    showCardWrapper?: boolean;
    title?: string;
}

/**
 * Reusable skeleton loader for MUI tables.
 * Shows shimmer animation while data is loading.
 */
export function TableSkeleton({
    columns = 4,
    rows = 5,
    showHeader = true,
    showCardWrapper = true,
    title = '',
}: TableSkeletonProps) {
    const tableContent = (
        <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
                {showHeader && (
                    <TableHead>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, i) => (
                                <TableCell key={i}>
                                    <Skeleton variant="text" width="70%" height={24} />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                )}
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <TableRow key={rowIdx}>
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <TableCell key={colIdx}>
                                    <Skeleton
                                        variant="text"
                                        width={colIdx === 0 ? '60%' : colIdx === columns - 1 ? '40%' : '80%'}
                                        height={20}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );

    if (showCardWrapper) {
        return (
            <Card>
                {title && <CardHeader title={<Skeleton variant="text" width={120} />} />}
                {tableContent}
            </Card>
        );
    }

    return tableContent;
}

/**
 * Stats cards skeleton for dashboard overview.
 */
export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <Stack direction="row" spacing={3} sx={{ width: '100%' }}>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} sx={{ flex: 1, p: 3 }}>
                    <Stack spacing={1}>
                        <Skeleton variant="text" width="60%" height={16} />
                        <Skeleton variant="text" width="40%" height={32} />
                        <Skeleton variant="text" width="50%" height={14} />
                    </Stack>
                </Card>
            ))}
        </Stack>
    );
}

/**
 * Chart skeleton placeholder.
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <Card sx={{ p: 3 }}>
            <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={height} />
        </Card>
    );
}
