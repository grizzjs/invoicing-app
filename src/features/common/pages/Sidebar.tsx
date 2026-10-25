import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Link } from "@tanstack/react-router";
import {
  Archive,
  FileText,
  LayoutDashboard,
  SearchIcon,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { SearchCommand } from "./search-command";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={17} />,
  },
  { label: "Customers", href: "/customers", icon: <Users size={17} /> },
  {
    label: "Purchase Orders",
    href: "/purchase-orders",
    icon: <ShoppingCart size={17} />,
  },
  { label: "Deliveries", href: "/deliveries", icon: <Truck size={17} /> },
  { label: "Invoices", href: "/invoices", icon: <FileText size={17} /> },
  { label: "Collections", href: "/collections", icon: <Archive size={17} /> },
];

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
}

export function NavItem({ label, icon, href, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-md text-base transition-colors
        ${
          active
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }
      `}
    >
      {icon}
      {label}
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="w-[260px] min-w-[260px] border-r border-border flex flex-col h-screen">
      <SearchCommand open={open} setOpen={setOpen} />
      {/* Logo */}
      <div className="h-14 flex items-center gap-6 p-6">
        <span className="font-bold text-xl">Engine Labs</span>
      </div>
      {/* Search */}
      <div className="p-6">
        <InputGroup className="max-w-sm">
          <InputGroupInput
            placeholder="Search..."
            onClick={() => setOpen(true)}
          />
          <InputGroupAddon>
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>⌘S</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavItem
            icon={item.icon}
            href={item.href}
            key={item.label}
            {...item}
          />
        ))}
      </nav>
    </aside>
  );
}
