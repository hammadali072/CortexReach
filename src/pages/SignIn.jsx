import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const DEFAULT_USER = {
        username: 'admin',
        password: '123'
    };

    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate sign in
        setTimeout(() => {
            if (username === DEFAULT_USER.username && password === DEFAULT_USER.password) {
                // Save user session (in a real app, this would be a token)
                localStorage.setItem('cortex_user', JSON.stringify({
                    name: 'Hammad Ali',
                    designation: 'Senior Outreach Specialist',
                    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop'
                }));
                navigate('/dashboard');
            } else {
                setError('Invalid username or password. Use admin/123');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
                    {/* Logo/Brand Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4 animate-float">
                            <i className="fas fa-brain text-white text-3xl"></i>
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                            Cortex<span className="text-indigo-400">Reach</span>
                        </h1>
                        <p className="text-gray-400 text-sm">Empowering your outreach with AI</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl mb-6 animate-shake">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="mb-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Demo Credentials</p>
                        <p className="text-gray-400 ml-1">Username: <span className="text-white">admin</span> | Password: <span className="text-white">123</span></p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="username">
                                Username
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <i className="fas fa-user text-sm"></i>
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <i className="fas fa-lock text-sm"></i>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 text-white pl-11 pr-12 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs px-1">
                            <label className="flex items-center text-gray-400 cursor-pointer group">
                                <input type="checkbox" className="hidden" />
                                <div className="w-4 h-4 rounded border border-white/20 mr-2 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                                    <i className="fas fa-check text-[10px] text-indigo-500 opacity-0 group-focus-within:opacity-100"></i>
                                </div>
                                Remember me
                            </label>
                            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center">
                                    Sign In
                                    <i className="fas fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                                </span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        </button>
                    </form>

                    <p className="text-center mt-8 text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <a href="#" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">Create account</a>
                    </p>
                </div>

                {/* Footer info */}
                <p className="text-center mt-6 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
                    &copy; 2024 CortexReach AI Systems
                </p>
            </div>
        </div>
    );
};

export default SignIn;
