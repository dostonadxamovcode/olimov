import { createElement } from 'react'
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Search as MagnifyingGlassIcon,
  User as UserIcon,
  Users as UsersIcon,
  Settings as Cog6ToothIcon,
  LogOut as ArrowRightOnRectangleIcon,
  LogIn as ArrowLeftOnRectangleIcon,
  Menu as Bars3Icon,
  X as XMarkIcon,
  Plus as PlusIcon,
  PlusCircle as PlusCircleIcon,
  Trash2 as TrashIcon,
  Edit2 as PencilSquareIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Bell as BellIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as ExclamationCircleIcon,
  Trophy as TrophyIcon,
  BookOpen as BookOpenIcon,
  Bookmark as BookmarkIcon,
  FileText as DocumentTextIcon,
  BarChart2 as ChartBarIcon,
  TrendingUp as ArrowTrendingUpIcon,
  TrendingDown as ArrowTrendingDownIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  GraduationCap as AcademicCapIcon,
  DollarSign as CurrencyDollarIcon,
  LayoutDashboard as Squares2X2Icon,
  Star as StarIcon,
  Crosshair as ViewfinderCircleIcon,
  Mail as EnvelopeIcon,
  Lock as LockClosedIcon,
  UserPlus as UserPlusIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
  ShieldCheck as ShieldCheckIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Send as PaperAirplaneIcon,
  Play as PlayIcon,
  Volume2 as SpeakerWaveIcon,
  Pencil as PencilIcon,
  MessageCircle as ChatBubbleOvalLeftIcon,
  Signal as SignalIcon,
  Sparkles as SparklesIcon,
  Zap as BoltIcon,
  Globe as GlobeAltIcon,
  RotateCcw as ArrowPathIcon,
  Check as CheckIcon,
  Mic as MicrophoneIcon,
  ClipboardList as ClipboardDocumentListIcon,
  Layers as RectangleStackIcon,
  Wrench as WrenchIcon,
  Home as HomeIcon,
  ShieldAlert as ShieldExclamationIcon,
} from 'lucide-react'

const sizeMap = {
  11: 'w-[11px] h-[11px]',
  12: 'w-3 h-3',
  13: 'w-[13px] h-[13px]',
  14: 'w-3.5 h-3.5',
  15: 'w-[15px] h-[15px]',
  16: 'w-4 h-4',
  18: 'w-[18px] h-[18px]',
  20: 'w-5 h-5',
  24: 'w-6 h-6',
  36: 'w-9 h-9',
  40: 'w-10 h-10',
  48: 'w-12 h-12',
}

function wrap(LucideIcon) {
  return function Icon({ size, className = '', strokeWidth, ...props }) {
    const sz = size ? (sizeMap[size] || `w-[${size}px] h-[${size}px]`) : ''
    const combined = [sz, className].filter(Boolean).join(' ')
    return createElement(LucideIcon, { className: combined, ...props })
  }
}

export const ArrowLeft = wrap(ArrowLeftIcon)
export const ArrowRight = wrap(ArrowRightIcon)
export const Search = wrap(MagnifyingGlassIcon)
export const User = wrap(UserIcon)
export const Users = wrap(UsersIcon)
export const Settings = wrap(Cog6ToothIcon)
export const LogOut = wrap(ArrowRightOnRectangleIcon)
export const LogIn = wrap(ArrowLeftOnRectangleIcon)
export const Menu = wrap(Bars3Icon)
export const X = wrap(XMarkIcon)
export const Plus = wrap(PlusIcon)
export const PlusCircle = wrap(PlusCircleIcon)
export const Trash2 = wrap(TrashIcon)
export const Edit2 = wrap(PencilSquareIcon)
export const FilePenLine = wrap(PencilSquareIcon)
export const ChevronDown = wrap(ChevronDownIcon)
export const ChevronUp = wrap(ChevronUpIcon)
export const ChevronLeft = wrap(ChevronLeftIcon)
export const ChevronRight = wrap(ChevronRightIcon)
export const Bell = wrap(BellIcon)
export const Clock = wrap(ClockIcon)
export const Clock3 = wrap(ClockIcon)
export const Timer = wrap(ClockIcon)
export const CheckCircle = wrap(CheckCircleIcon)
export const XCircle = wrap(XCircleIcon)
export const AlertCircle = wrap(ExclamationCircleIcon)
export const Trophy = wrap(TrophyIcon)
export const Award = wrap(TrophyIcon)
export const BookOpen = wrap(BookOpenIcon)
export const BookMarked = wrap(BookmarkIcon)
export const FileText = wrap(DocumentTextIcon)
export const BarChart2 = wrap(ChartBarIcon)
export const BarChart3 = wrap(ChartBarIcon)
export const TrendingUp = wrap(ArrowTrendingUpIcon)
export const TrendingDown = wrap(ArrowTrendingDownIcon)
export const MoreHorizontal = wrap(EllipsisHorizontalIcon)
export const GraduationCap = wrap(AcademicCapIcon)
export const DollarSign = wrap(CurrencyDollarIcon)
export const LayoutDashboard = wrap(Squares2X2Icon)
export const Star = wrap(StarIcon)
export const Target = wrap(ViewfinderCircleIcon)
export const Mail = wrap(EnvelopeIcon)
export const Lock = wrap(LockClosedIcon)
export const LockKeyhole = wrap(LockClosedIcon)
export const UserPlus = wrap(UserPlusIcon)
export const Moon = wrap(MoonIcon)
export const Sun = wrap(SunIcon)
export const Shield = wrap(ShieldCheckIcon)
export const ShieldCheck = wrap(ShieldCheckIcon)
export const Phone = wrap(PhoneIcon)
export const MapPin = wrap(MapPinIcon)
export const Send = wrap(PaperAirplaneIcon)
export const Play = wrap(PlayIcon)
export const Headphones = wrap(SpeakerWaveIcon)
export const PenTool = wrap(PencilIcon)
export const MessageCircle = wrap(ChatBubbleOvalLeftIcon)
export const Signal = wrap(SignalIcon)
export const Sparkles = wrap(SparklesIcon)
export const Sprout = wrap(SparklesIcon)
export const Zap = wrap(BoltIcon)
export const Globe = wrap(GlobeAltIcon)
export const Save = wrap(BookmarkIcon)
export const RotateCcw = wrap(ArrowPathIcon)
export const Check = wrap(CheckIcon)
export const Mic = wrap(MicrophoneIcon)
export const ClipboardList = wrap(ClipboardDocumentListIcon)
export const Layers = wrap(RectangleStackIcon)
export const Wrench = wrap(WrenchIcon)
export const Home = wrap(HomeIcon)
export const Calendar = wrap(ClockIcon)

export function Loader2({ size, className = '', ...props }) {
  const sz = size ? (sizeMap[size] || `w-[${size}px] h-[${size}px]`) : ''
  const combined = [sz, 'animate-spin', className].filter(Boolean).join(' ')
  return createElement(ArrowPathIcon, { className: combined, ...props })
}

export function Dot({ size, className = '', ...props }) {
  const sz = size ? parseInt(size) : 16
  return createElement('span', {
    className: ['inline-block rounded-full bg-current', className].filter(Boolean).join(' '),
    style: { width: sz / 4, height: sz / 4 },
    ...props,
  })
}
