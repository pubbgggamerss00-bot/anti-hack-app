'use client'

import {
  KeyRound, Gamepad2, Instagram, Send, Mail, HelpCircle, Baby, MessageCircle, Smartphone,
  GraduationCap, Fish, Monitor, CardSim, Bug, MessageSquare, ShieldCheck, CreditCard,
  MessagesSquare, Shield, CircleUserRound, EyeOff, Clock, SearchCheck, Crown, PersonStanding,
  Layers, BarChart3, Zap, ListChecks, LayoutGrid, Lock, Globe, PackageX, AppWindow,
  BatteryCharging, ScanSearch, BellOff, Settings2, Wifi, Users, MapPin, Fingerprint,
  RefreshCw, Usb, Camera, AlertTriangle, Lightbulb, Wrench, ClipboardCheck, Flag,
  BookOpen, Home, Settings, ChevronLeft, Star, ShieldAlert, Sparkles, XCircle, CheckCircle2,
  FileText, Info, LockKeyhole, UserRound, Rocket, HeartHandshake, ExternalLink, Copy,
  RefreshCcw, Trash2, Download, Eye, BadgeCheck, TrendingUp, CalendarDays, HardDrive,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  KeyRound, Gamepad2, Instagram, Send, Mail, HelpCircle, Baby, MessageCircle, Smartphone,
  GraduationCap, Fish, Monitor, CardSim, Bug, MessageSquare, ShieldCheck, CreditCard,
  MessagesSquare, Shield, CircleUserRound, EyeOff, Clock, SearchCheck, Crown, PersonStanding,
  Layers, BarChart3, Zap, ListChecks, LayoutGrid, Lock, Globe, PackageX, AppWindow,
  BatteryCharging, ScanSearch, BellOff, Settings2, Wifi, Users, MapPin, Fingerprint,
  RefreshCw, Usb, Camera, AlertTriangle, Lightbulb, Wrench, ClipboardCheck, Flag,
  BookOpen, Home, Settings, ChevronLeft, Star, ShieldAlert, Sparkles, XCircle, CheckCircle2,
  FileText, Info, LockKeyhole, UserRound, Rocket, HeartHandshake, ExternalLink, Copy,
  RefreshCcw, Trash2, Download, Eye, BadgeCheck, TrendingUp, CalendarDays, HardDrive,
}

export function DynIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Shield
  return <Icon className={className} aria-hidden="true" />
}
