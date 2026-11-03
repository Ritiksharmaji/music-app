import { LayoutDashboardIcon } from "lucide-react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import UserMenu from "./UserMenu";
import { useAuthStore } from "@/stores/useAuthStore";
import { ADMIN_URL } from "@/lib/hosts";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = () => {
	const { user, isAdmin } = useAuthStore();

	return (
		<div
			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10
    '
		>
			<div className='flex gap-2 items-center'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				Spotify
			</div>
			<div className='flex items-center gap-4'>
				{isAdmin && (
					// a full link when the dashboard is on its own subdomain
					<a href={ADMIN_URL} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4  mr-2' />
						Admin Dashboard
					</a>
				)}

				{user ? <UserMenu /> : <SignInOAuthButtons />}
			</div>
		</div>
	);
};
export default Topbar;
