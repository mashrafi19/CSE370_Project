import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  Message01Icon,
  Search01Icon,
  Building03Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

type TabOption = "explore" | "inbox" | "search" | "company" | "profile"

interface BottomAppBarProps {
  activeTab: TabOption
  onTabChange: (tab: TabOption) => void
}

const tabs = [
  { id: "explore" as TabOption, label: "Explore", icon: Home01Icon },
  { id: "inbox" as TabOption, label: "Inbox", icon: Message01Icon },
  { id: "search" as TabOption, label: "Search", icon: Search01Icon },
  { id: "company" as TabOption, label: "Company", icon: Building03Icon },
  { id: "profile" as TabOption, label: "Profile", icon: UserCircleIcon },
]

export function BottomAppBar({ activeTab, onTabChange }: BottomAppBarProps) {
  return (
    <nav className="absolute right-0 bottom-0 left-0 z-50 border-t bg-background">
      <div className="flex w-full items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors hover:bg-muted/50"
              aria-label={tab.label}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <HugeiconsIcon
                  icon={tab.icon}
                  size={20}
                  strokeWidth={1.5}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { TabOption }
