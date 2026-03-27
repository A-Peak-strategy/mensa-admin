'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { Warning as WarningIcon, CheckCircle as CheckIcon, Info as InfoIcon } from '@phosphor-icons/react';

type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    loading?: boolean;
}

const typeConfig: Record<ConfirmType, { color: string; bgColor: string; icon: React.ReactNode }> = {
    danger: {
        color: '#d32f2f',
        bgColor: '#ffebee',
        icon: <WarningIcon size={32} weight="fill" color="#d32f2f" />,
    },
    warning: {
        color: '#ed6c02',
        bgColor: '#fff4e5',
        icon: <WarningIcon size={32} weight="fill" color="#ed6c02" />,
    },
    info: {
        color: '#0288d1',
        bgColor: '#e3f2fd',
        icon: <InfoIcon size={32} weight="fill" color="#0288d1" />,
    },
    success: {
        color: '#2e7d32',
        bgColor: '#e8f5e9',
        icon: <CheckIcon size={32} weight="fill" color="#2e7d32" />,
    },
};

/**
 * Styled confirmation dialog with type-based colors and icons.
 */
export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    loading = false,
}: ConfirmDialogProps) {
    const config = typeConfig[type];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                },
            }}
        >
            <Box sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: config.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    {config.icon}
                </Box>
                <DialogTitle sx={{ py: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                    {title}
                </DialogTitle>
            </Box>
            <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
                <DialogContentText sx={{ color: 'text.secondary' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="inherit"
                    disabled={loading}
                    sx={{ minWidth: 100 }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    disabled={loading}
                    sx={{
                        minWidth: 100,
                        bgcolor: config.color,
                        '&:hover': { bgcolor: config.color, filter: 'brightness(0.9)' },
                    }}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
