import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
	const { user, login, signup, isLoading, error } = useAuthStore();
	const navigate = useNavigate();
	const [form, setForm] = useState({ fullName: "", email: "", password: "" });
	const isSignup = mode === "signup";

	if (user) return <Navigate to='/' replace />;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (isSignup) await signup(form.fullName, form.email, form.password);
			else await login(form.email, form.password);
			navigate("/");
		} catch {
			// error is shown from the store
		}
	};

	return (
		<div className='min-h-screen w-full bg-black flex items-center justify-center p-4'>
			<Card className='w-full max-w-md bg-zinc-900 border-zinc-800'>
				<CardContent className='pt-8 space-y-6'>
					<div className='flex flex-col items-center gap-3'>
						<img src='/spotify.png' alt='Spotify' className='size-12' />
						<h1 className='text-2xl font-bold text-white'>
							{isSignup ? "Sign up to start listening" : "Log in to Spotify"}
						</h1>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						{isSignup && (
							<Input
								placeholder='Full name'
								value={form.fullName}
								onChange={(e) => setForm({ ...form, fullName: e.target.value })}
								className='bg-zinc-800 border-zinc-700 h-11'
								required
							/>
						)}
						<Input
							type='email'
							placeholder='Email'
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							className='bg-zinc-800 border-zinc-700 h-11'
							required
						/>
						<Input
							type='password'
							placeholder='Password'
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							className='bg-zinc-800 border-zinc-700 h-11'
							minLength={6}
							required
						/>

						{error && <p className='text-sm text-red-400'>{error}</p>}

						<Button type='submit' disabled={isLoading} className='w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-black'>
							{isLoading ? <Loader className='size-4 animate-spin' /> : isSignup ? "Sign up" : "Log in"}
						</Button>
					</form>

					<p className='text-center text-sm text-zinc-400'>
						{isSignup ? "Already have an account? " : "Don't have an account? "}
						<Link to={isSignup ? "/login" : "/signup"} className='text-white underline'>
							{isSignup ? "Log in" : "Sign up"}
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
};
export default AuthPage;
