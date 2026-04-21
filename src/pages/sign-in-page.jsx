import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Brain,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    User,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Zap,
    AlertCircle,
    Loader2
} from 'lucide-react';

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

const SignInPage = () => {
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();
    const [state, dispatch] = useReducer(reducer, initialState);

    const { mode, name, email, password, showPassword, isLoading, error } = state;

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

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#080b14] selection:bg-indigo-500/30 overflow-hidden">

            {/* Visual Column - Hidden on Mobile */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-[#0c101d]" />
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />

                {/* Brand */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Brain className="text-white fill-white/10" size={24} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white font-idGrotesk">CortexReach</span>
                </div>

                {/* Marketing Content */}
                <div className="relative z-10 space-y-8 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles size={12} /> Next-Gen Outreach
                    </div>
                    <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight">
                        Scale your <span className="bg-gradient-brand bg-clip-text text-transparent">intelligence</span> beyond limits.
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        The world's most advanced AI-driven outbound platform. Harness predictive modeling and autonomous lead discovery to grow your pipeline 10x faster.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                        {[
                            { icon: ShieldCheck, text: "Enterprise Security", sub: "AES-256 Encryption" },
                            { icon: Zap, text: "Instant Launch", sub: "0 to 100k in seconds" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400">
                                    <item.icon size={18} />
                                </div>
                                <span className="text-white font-bold text-sm tracking-tight">{item.text}</span>
                                <span className="text-slate-500 text-xs">{item.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-10 flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="size-10 rounded-full border-2 border-[#0c101d] bg-slate-800 flex items-center justify-center overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-400 text-sm font-medium">
                        Trusted by <span className="text-white font-bold">2,500+</span> teams worldwide
                    </p>
                </div>

                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Form Column */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative">
                {/* Background for mobile */}
                <div className="lg:hidden absolute inset-0 bg-[#080b14]" />
                <div className="lg:hidden absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[80px]" />
                </div>

                <div className="w-full max-w-[420px] relative z-10 space-y-10">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl">
                                <Brain className="text-white" size={32} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
                        </h3>
                        <p className="text-slate-400 font-medium">
                            {mode === 'login'
                                ? 'Sign in with your email to continue your campaigns.'
                                : 'Join the elite network of automated entrepreneurs today.'}
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in shake duration-500">
                            <AlertCircle className="text-red-400 shrink-0" size={18} />
                            <p className="text-sm text-red-100 font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'signup' && (
                            <div className="space-y-2 group animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block" htmlFor="name-input">
                                    Full Identity
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        id="name-input"
                                        type="text"
                                        placeholder="John Wick"
                                        value={name}
                                        onChange={e => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-800 text-white pl-12 pr-4 h-14 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block" htmlFor="email-input">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email-input"
                                    type="email"
                                    placeholder="agent@cortex.reach"
                                    value={email}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 text-white pl-12 pr-4 h-14 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block" htmlFor="pass-input">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="pass-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 text-white pl-12 pr-14 h-14 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-700 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => dispatch({ type: 'TOGGLE_PASSWORD' })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 h-14 rounded-2xl text-white font-bold tracking-tight shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center justify-center">
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Login' : 'Sign Up'}
                                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                                    </>
                                )}
                            </div>
                            {/* Animated reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-900">
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_MODE' })}
                            className="w-full text-center py-2"
                        >
                            <span className="text-slate-500 text-sm font-medium">
                                {mode === 'login' ? "New here?" : 'Already a member?'}
                            </span>{' '}
                            <span className="text-indigo-400 text-sm font-bold hover:text-indigo-300 transition-colors">
                                {mode === 'login' ? 'Sign up' : 'Login'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
