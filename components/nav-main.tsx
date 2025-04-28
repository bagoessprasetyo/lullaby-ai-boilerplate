"use client"

import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"

import { usePathname } from 'next/navigation';
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname();
  return (
  
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-3"/> */}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title} >
            <Link href={item.url}>
            <SidebarMenuButton 
              tooltip={item.title}
              className={pathname === item.url ? 'bg-accent text-accent-foreground' : ''}
            >
              
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              
            </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
