import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { ShoppingCart as ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { ForkKnife as ForkKnifeIcon } from '@phosphor-icons/react/dist/ssr/ForkKnife';
import { Image as ImageIcon } from '@phosphor-icons/react/dist/ssr/Image';
import { ChatCircle as ChatCircleIcon } from '@phosphor-icons/react/dist/ssr/ChatCircle';
import { Envelope as EnvelopeIcon } from '@phosphor-icons/react/dist/ssr/Envelope';

export const navIcons = {
  calendar: CalendarIcon,
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  'shopping-cart': ShoppingCartIcon,
  'fork-knife': ForkKnifeIcon,
  image: ImageIcon,
  'chat-circle': ChatCircleIcon,
  envelope: EnvelopeIcon,
} as Record<string, Icon>;

