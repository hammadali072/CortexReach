import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
    mode: 'login', // 'login' | 'signup'
    name: '',
    email: '',
    password: '',
    showPassword: false,
    isLoading: false,
    error: ''
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'TOGGLE_MODE':
            return { 
                ...initialState, 
                mode: state.mode === 'login' ? 'signup' : 'login' 
            };
        case 'SET_LOADING':
            return { ...state, isLoading: action.value, error: action.value ? '' : state.error };
        case 'SET_ERROR':
            return { ...state, error: action.value, isLoading: false };
        case 'TOGGLE_PASSWORD':
            return { ...state, showPassword: !state.showPassword };
        default:
            return state;
    }
}

const SignIn = () => {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    const [state, dispatch] = useReducer(reducer, initialState);

    const { mode, name, email, password, showPassword, isLoading, error } = state;

    // ── Submit handler ───────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: 'SET_LOADING', value: true });

        try {
            if (mode === 'signup') {
                if (!name.trim()) throw new Error('Full name is required.');
                await signUp({ name: name.trim(), email, password });
            } else {
                await signIn({ email, password });
            }
            navigate('/dashboard');
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password. Please try again.',
                'auth/invalid-credential': 'Invalid email or password.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
            };
            dispatch({ type: 'SET_ERROR', value: messages[err.code] || err.message || 'Something went wrong.' });
        } finally {
            dispatch({ type: 'SET_LOADING', value: false });
        }
    };

    const toggleMode = () => {
        dispatch({ type: 'TOGGLE_MODE' });
    };

    // ── Render ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-lg blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-lg blur-[120px] animate-pulse delay-700" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="glass rounded-lg p-8 border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">

                    {/* Brand */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg shadow-lg mb-4 animate-float">
                            <i className="fas fa-brain text-white text-3xl" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                            Cortex<span className="text-indigo-400">Reach</span>
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {mode === 'login' ? 'Sign in to your workspace' : 'Create your free account'}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-lg mb-6 animate-shake">
                            <i className="fas fa-exclamation-circle mr-2" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name — signup only */}
                        {mode === 'signup' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="name">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                        <i className="fas fa-id-card text-sm" />
                                    </span>
                                    <input
                                         id="name"
                                         type="text"
                                         placeholder="John Doe"
                                         value={name}
                                         onChange={e => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
                                         className="w-full bg-[#1e293b]/50 border border-white/10 text-white pl-11 pr-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                                         required
                                     />
                                 </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <i className="fas fa-envelope text-sm" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 text-white pl-11 pr-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                                    <i className="fas fa-lock text-sm" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                                    value={password}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
                                    className="w-full bg-[#1e293b]/50 border border-white/10 text-white pl-11 pr-12 py-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => dispatch({ type: 'TOGGLE_PASSWORD' })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group mt-2"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-lg animate-spin" />
                                    <span>{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center">
                                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                                    <i className="fas fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                        </button>
                    </form>

                    {/* Toggle mode */}
                    <p className="text-center mt-8 text-gray-400 text-sm">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={toggleMode}
                            className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
                        >
                            {mode === 'login' ? 'Create account' : 'Sign in'}
                        </button>
                    </p>
                </div>

                <p className="text-center mt-6 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
                    &copy; 2026 CortexReach AI Systems
                </p>
            </div>
        </div>
    );
};

export default SignIn;
