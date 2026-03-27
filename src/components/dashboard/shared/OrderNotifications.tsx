'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Snackbar, Alert, Badge, IconButton, Box, Typography, Stack, Paper, Slide } from '@mui/material';
import { Bell as BellIcon } from '@phosphor-icons/react';
import { BASE_URL } from '@/api/api';

interface OrderNotification {
    id: string;
    orderId: string;
    customerName: string;
    total: number;
    timestamp: number;
    read: boolean;
}

interface OrderNotificationsProps {
    pollingInterval?: number; // in milliseconds
}

/**
 * Admin notification component that polls for new orders.
 * Shows a badge count and snackbar alerts for new orders.
 */
export function OrderNotifications({ pollingInterval = 30000 }: OrderNotificationsProps) {
    const [notifications, setNotifications] = useState<OrderNotification[]>([]);
    const [lastChecked, setLastChecked] = useState<number>(Date.now());
    const [showAlert, setShowAlert] = useState(false);
    const [latestNotification, setLatestNotification] = useState<OrderNotification | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const knownOrderIds = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);

    const checkForNewOrders = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/orders/get-all`);
            const data = await res.json();

            if (data.status && data.data) {
                const orders = data.data as Array<{
                    id: string;
                    user_name?: string;
                    user_email: string;
                    total: number;
                    createdAt: { _seconds: number } | string;
                }>;

                // Find orders we haven't seen before
                const newOrders = orders.filter((order) => !knownOrderIds.current.has(order.id));

                if (!isFirstLoad.current && newOrders.length > 0) {
                    const newNotifications: OrderNotification[] = newOrders.map((order) => ({
                        id: `notif-${order.id}`,
                        orderId: order.id.slice(0, 8),
                        customerName: order.user_name || order.user_email || 'Unknown',
                        total: order.total,
                        timestamp: Date.now(),
                        read: false,
                    }));

                    setNotifications((prev) => [...newNotifications, ...prev].slice(0, 20));

                    // Show alert for the most recent new order
                    if (newNotifications.length > 0) {
                        setLatestNotification(newNotifications[0]);
                        setShowAlert(true);
                    }
                }

                // Update known order IDs
                orders.forEach((order) => knownOrderIds.current.add(order.id));
                isFirstLoad.current = false;
                setLastChecked(Date.now());
            }
        } catch {
            // Silently fail polling
        }
    }, []);

    // Initial load and polling
    useEffect(() => {
        checkForNewOrders();
        const interval = setInterval(checkForNewOrders, pollingInterval);
        return () => clearInterval(interval);
    }, [checkForNewOrders, pollingInterval]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Bell Icon with Badge */}
            <IconButton
                onClick={() => {
                    setShowDropdown(!showDropdown);
                    if (!showDropdown) markAllRead();
                }}
                sx={{ color: 'text.secondary' }}
            >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    <BellIcon size={24} />
                </Badge>
            </IconButton>

            {/* Dropdown */}
            <Slide direction="down" in={showDropdown} mountOnEnter unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: 320,
                        maxHeight: 400,
                        overflow: 'auto',
                        zIndex: 1000,
                        mt: 1,
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Order Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Last checked: {new Date(lastChecked).toLocaleTimeString()}
                        </Typography>
                    </Box>

                    {notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">No new orders</Typography>
                        </Box>
                    ) : (
                        <Stack>
                            {notifications.map((notif) => (
                                <Box
                                    key={notif.id}
                                    sx={{
                                        p: 2,
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        bgcolor: notif.read ? 'transparent' : 'action.hover',
                                        '&:hover': { bgcolor: 'action.selected' },
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={500}>
                                        New Order #{notif.orderId}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {notif.customerName} • LKR {notif.total.toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Paper>
            </Slide>

            {/* Snackbar Alert */}
            <Snackbar
                open={showAlert}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity="info"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {latestNotification && (
                        <>
                            New Order #{latestNotification.orderId} from {latestNotification.customerName}
                            <br />
                            Total: LKR {latestNotification.total.toLocaleString()}
                        </>
                    )}
                </Alert>
            </Snackbar>
        </Box>
    );
}
