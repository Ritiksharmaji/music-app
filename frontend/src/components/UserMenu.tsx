import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
	const { user, logout } = useAuthStore();
	const navigate = useNavigate();

	if (!user) return null;

	return (
		<div className='flex items-center gap-2'>
			<Avatar className='size-8' title={user.email}>
				<AvatarImage src={user.imageUrl} alt={user.fullName} />
				<AvatarFallback>{user.fullName[0]}</AvatarFallback>
			</Avatar>
			<Button
				variant='ghost'
				size='icon'
				title='Log out'
				onClick={() => {
					logout();
					navigate("/");
				}}
			>
				<LogOut className='size-4' />
			</Button>
		</div>
	);
};
export default UserMenu;
