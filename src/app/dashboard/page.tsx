'use client';

import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Skeleton, Typography } from '@mui/material';
import { BASE_URL } from '@/api/api';
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  basePrice: number;
}

interface Order {
  id: string;
  user_name?: string;
  user_email: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  createdAt: { _seconds: number } | string;
}

interface Food {
  id: string;
  name: string;
  imageUrls?: { url: string }[];
  updatedAt?: string;
  createdAt?: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
  recentProducts: Food[];
}

function formatDate(d: { _seconds: number } | string | undefined): Date {
  if (!d) return new Date();
  if (typeof d === 'string') return new Date(d);
  return new Date(d._seconds * 1000);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, foodsRes] = await Promise.all([
          fetch(`${BASE_URL}/orders/get-all`),
          fetch(`${BASE_URL}/foods`),
        ]);

        const ordersData = await ordersRes.json();
        const foodsData = await foodsRes.json();

        const orders: Order[] = ordersData.status ? ordersData.data : [];
        const foods: Food[] = foodsData.status ? foodsData.data : [];

        // Calculate stats
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const ordersByStatus = orders.reduce(
          (acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        // Sort orders by date (newest first)
        const sortedOrders = [...orders].sort((a, b) => {
          const aTime = typeof a.createdAt === 'object' ? a.createdAt._seconds : new Date(a.createdAt).getTime() / 1000;
          const bTime = typeof b.createdAt === 'object' ? b.createdAt._seconds : new Date(b.createdAt).getTime() / 1000;
          return bTime - aTime;
        });

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders: ordersByStatus.pending || 0,
          totalProducts: foods.length,
          ordersByStatus,
          recentOrders: sortedOrders.slice(0, 6),
          recentProducts: foods.slice(0, 5),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          totalProducts: 0,
          ordersByStatus: {},
          recentOrders: [],
          recentProducts: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} lg={3} sm={6} xs={12}>
            <Skeleton variant="rounded" height={150} />
          </Grid>
        ))}
        <Grid lg={8} xs={12}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
        <Grid lg={4} md={6} xs={12}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
      </Grid>
    );
  }

  const completionRate = stats
    ? stats.totalOrders > 0
      ? Math.round(((stats.ordersByStatus.delivered || 0) / stats.totalOrders) * 100)
      : 0
    : 0;

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Budget
          diff={12}
          trend="up"
          sx={{ height: '100%' }}
          value={`LKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers
          diff={16}
          trend="up"
          sx={{ height: '100%' }}
          value={String(stats?.totalOrders || 0)}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={completionRate} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value={String(stats?.pendingOrders || 0)} />
      </Grid>
      <Grid lg={8} xs={12}>
        <Sales
          chartSeries={[
            { name: 'Orders', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Revenue (K)', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <Traffic
          chartSeries={[
            stats?.ordersByStatus.delivered || 0,
            stats?.ordersByStatus.pending || 0,
            stats?.ordersByStatus.confirmed || 0,
          ]}
          labels={['Delivered', 'Pending', 'Confirmed']}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts
          products={(stats?.recentProducts || []).map((food) => ({
            id: food.id,
            name: food.name,
            image: food.imageUrls?.[0]?.url || '/assets/product-placeholder.png',
            updatedAt: new Date(food.updatedAt || food.createdAt || Date.now()),
          }))}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <LatestOrders
          orders={(stats?.recentOrders || []).map((order) => ({
            id: order.id.slice(0, 8),
            customer: { name: order.user_name || order.user_email || 'Unknown' },
            amount: order.total,
            status: order.status,
            createdAt: formatDate(order.createdAt),
          }))}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
