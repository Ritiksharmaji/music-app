import { Link } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const SignInOAuthButtons = () => {
	return (
		<div className='flex items-center gap-2'>
			<Link to='/signup' className={cn(buttonVariants({ variant: "ghost" }), "text-zinc-300 h-10")}>
				Sign up
			</Link>
			<Link to='/login' className={cn(buttonVariants({ variant: "secondary" }), "h-10 px-6")}>
				Log in
			</Link>
		</div>
	);
};
export default SignInOAuthButtons;
