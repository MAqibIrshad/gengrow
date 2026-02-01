'use client'

import { BarChart, Compass, Layout, List, Brain, Send, Headset} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SidebarItem } from './sidebar-item'

const guestRoutes = [
  {
    icon: Layout,
    label: 'Dashboard',
    href: '/',
  },
  {
    icon: Compass,
    label: 'Browse',
    href: '/search',
  },

  {
    icon: Send,
    label: 'Discussion',
    href: '/search',

  },

  {
    icon:ScrollText,
    label:'Keep',
    href: '/keep'
  },

  {
    icon:BrainCircuit,
    label: 'Deep',
    href: '/deep'
  },
  {
    icon: 
    label: 'Notification',
    href: '/notify'
  }
]

const teacherRoutes = [
  {
    icon: List,
    label: 'Courses',
    href: '/teacher/courses',
  },
  {
    icon: BarChart,
    label: 'Analytics',
    href: '/teacher/analytics',
  },

  {
    icon: Brain,
    label: 'Quiz Agent',
    href: '/teacher/quizagent'
  },

  {
    icon:Headset,
    label: 'Meet',
    href: '/meet'
  },
  {

  }
]

export const SidebarRoutes = () => {
  const pathname = usePathname()

  const isTeacherPage = pathname?.startsWith('/teacher')

  const routes = isTeacherPage ? teacherRoutes : guestRoutes
  return (
    <div className="flex w-full flex-col">
      {routes.map((route) => (
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      ))}
    </div>
  )
}
