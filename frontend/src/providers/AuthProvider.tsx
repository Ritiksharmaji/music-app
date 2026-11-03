import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { Loader } from "lucide-react";
import { useEffect } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { user, isCheckingAuth, checkAuth, checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (!user) return;

		checkAdminStatus();
		initSocket(user._id);

		// clean up on logout / unmount
		return () => disconnectSocket();
	}, [user, checkAdminStatus, initSocket, disconnectSocket]);

	if (isCheckingAuth)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-emerald-500 animate-spin' />
			</div>
		);

	return <>{children}</>;
};
export default AuthProvider;
