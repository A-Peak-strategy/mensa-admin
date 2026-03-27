export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    category: '/dashboard/category',
    events: '/dashboard/events',
    orders: '/dashboard/orders',
    foods: '/dashboard/foods',
    gallery: '/dashboard/gallery',
    quotes: '/dashboard/quotes',
    contacts: '/dashboard/contacts',
  }
  // errors: { notFound: '/errors/not-found' },
} as const;

