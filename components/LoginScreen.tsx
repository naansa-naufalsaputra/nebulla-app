
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Mail, User, ArrowRight, Loader } from 'lucide-react';

const LoginScreen: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email.");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) throw error;
            setMagicLinkSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const { error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 relative overflow-hidden font-display">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-surface-light dark:bg-surface-dark border border-border-color rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="size-16 bg-primary dark:bg-primary-dark rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-[32px]">auto_awesome_mosaic</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text-main dark:text-white mb-2 tracking-tight">Nebulla Workspace</h1>
                    <p className="text-text-secondary dark:text-gray-400 text-sm">
                        Please sign in to access your knowledge base.
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs rounded-lg border border-red-200 dark:border-red-800"
                    >
                        {error}
                    </motion.div>
                )}

                {magicLinkSent ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 text-center"
                    >
                        <div className="size-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center text-green-600 dark:text-green-300 mb-3">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-green-800 dark:text-green-200 mb-1">Check your inbox</h3>
                        <p className="text-sm text-green-700 dark:text-green-300">We've sent a magic link to <strong>{email}</strong></p>
                        <button
                            onClick={() => setMagicLinkSent(false)}
                            className="mt-4 text-xs text-green-700 underline hover:text-green-900 dark:hover:text-green-100"
                        >
                            Try different email
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-main dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm active:scale-[0.98] group relative overflow-hidden"
                        >
                            {loading ? (
                                <Loader className="animate-spin size-5" />
                            ) : (
                                <>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                    <span>Sign in with Google</span>
                                </>
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surface-light dark:bg-surface-dark px-2 text-text-secondary dark:text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-text-main dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md active:scale-[0.98]"
                            >
                                {loading ? <Loader className="animate-spin size-4" /> : <span>Send Magic Link</span>}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </form>

                        <button
                            onClick={handleGuestLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 text-text-secondary dark:text-gray-400 hover:text-text-main dark:hover:text-white py-2 text-sm font-medium transition-colors group"
                        >
                            <User size={16} className="group-hover:text-primary transition-colors" />
                            <span>Continue as Guest</span>
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span className="font-mono">v0.9.3</span>
                    <span className="flex items-center gap-1 font-mono"><span className="size-1.5 rounded-full bg-green-500"></span> Online</span>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginScreen;
