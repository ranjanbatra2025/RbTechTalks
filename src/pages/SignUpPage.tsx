import { FormEvent, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

const SignUpPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // If email confirmation is enabled, user must verify email
    alert('Sign up successful! Please check your email to confirm your account.')
    navigate('/login')
  }

  const handleGoogleSignIn = async () => {
    const redirectTo = import.meta.env.VITE_FRONTEND_URL || window.location.origin

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card shadow-lg rounded-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent py-2 rounded-md disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t" />
          <span className="px-2 text-xs text-muted-foreground">OR</span>
          <div className="flex-1 border-t" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full border py-2 rounded-md flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Continue with Google</span>
        </button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage
