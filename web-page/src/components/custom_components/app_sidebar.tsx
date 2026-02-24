import { Link } from "@tanstack/react-router";
import {
	BarChart2,
	CreditCard,
	IdCard,
	LayoutGrid,
	LogOut, // Added for the icon
	MoreVertical,
	Settings,
	Users,
	Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
// Import Dropdown components
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/context/auth_context"; // Import your auth hook
import web_logo from "../../../public/web_logo.png";

const navGroups = [
	{
		label: "MANAGEMENT",
		items: [
			{ title: "Members", url: "/authenticated/members", icon: Users },
			{
				title: "Entry Logs",
				url: "/authenticated/entry-logs",
				icon: IdCard,
			},
			{
				title: "Membership Plan",
				url: "/authenticated/plans",
				icon: CreditCard,
			},
		],
	},
	{
		label: "BUSINESS",
		items: [
			{ title: "Payments", url: "/authenticated/payments", icon: Wallet },
			{
				title: "Insights",
				url: "/authenticated/insights",
				icon: BarChart2,
			},
		],
	},
	{
		label: "SYSTEM",
		items: [
			{
				title: "Settings",
				url: "/authenticated/settings",
				icon: Settings,
			},
		],
	},
];

export function AppSidebar() {
	const { user, signOut } = useAuth(); // Get live user and logout function

	// Helper to get initials from name for AvatarFallback
	const initials = user?.firstName
		? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
		: "U";

	return (
		<Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground dark">
			<SidebarHeader className="p-6">
				<Link to="/" className="flex items-center gap-3">
					<img
						src={web_logo}
						alt="Smart Gym Logo"
						className="h-8 w-8"
					/>
					<span className="text-lg font-bold text-foreground font-header-bold">
						SyncFit
					</span>
				</Link>
			</SidebarHeader>

			<SidebarContent className="px-4 pb-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
				<SidebarMenu className="mb-6">
					<SidebarMenuItem>
						<Link
							to="/authenticated/overview"
							className="flex w-full items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors"
							activeProps={{
								className:
									"bg-primary text-primary-foreground shadow-sm",
							}}
							inactiveProps={{
								className:
									"text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
							}}
						>
							<LayoutGrid className="h-5 w-5" />
							<span className="text-base font-semibold">
								Overview
							</span>
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>

				{navGroups.map((group) => (
					<SidebarGroup key={group.label} className="mb-4">
						<SidebarGroupLabel className="mb-2 px-2 text-xs font-semibold tracking-wider text-muted-foreground">
							{group.label}
						</SidebarGroupLabel>
						<SidebarMenu>
							{group.items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<Link
										to={item.url}
										className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
										activeProps={{
											className:
												"bg-primary text-primary-foreground",
										}}
										inactiveProps={{
											className:
												"text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
										}}
									>
										<item.icon className="h-4 w-4" />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border p-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="group flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-sidebar-accent outline-none">
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9 border border-sidebar-border">
											<AvatarImage src="" />
											<AvatarFallback className="bg-muted text-muted-foreground">
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col items-start text-sm">
											<span className="font-semibold text-foreground truncate max-w-[120px]">
												{user?.firstName}{" "}
												{user?.lastName}
											</span>
											<span className="text-xs text-muted-foreground capitalize">
												{user?.role || "User"}
											</span>
										</div>
									</div>
									<MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side="top"
								align="end"
								className="w-56 mb-2 bg-sidebar border-sidebar-border text-sidebar-foreground dark"
							>
								<DropdownMenuLabel>
									My Account
								</DropdownMenuLabel>
								<DropdownMenuSeparator className="bg-sidebar-border" />
								<DropdownMenuItem className="cursor-pointer focus:bg-sidebar-accent">
									<Settings className="mr-2 h-4 w-4" />
									<span>Settings</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator className="bg-sidebar-border" />
								<DropdownMenuItem
									onClick={() => signOut()}
									className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
