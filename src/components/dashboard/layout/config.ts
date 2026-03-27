import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'orders', title: 'Manage Orders', href: paths.dashboard.orders, icon: 'shopping-cart' },
  { key: 'foods', title: 'Manage Menu', href: paths.dashboard.foods, icon: 'fork-knife' },
  { key: 'category', title: 'Manage Categories', href: paths.dashboard.category, icon: 'gear-six' },
  { key: 'events', title: 'Manage Events', href: paths.dashboard.events, icon: 'calendar' },
  { key: 'gallery', title: 'Manage Gallery', href: paths.dashboard.gallery, icon: 'image' },
  { key: 'quotes', title: 'Quote Requests', href: paths.dashboard.quotes, icon: 'chat-circle' },
  { key: 'contacts', title: 'Contact Messages', href: paths.dashboard.contacts, icon: 'envelope' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];

