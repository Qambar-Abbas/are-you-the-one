import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const HARD_CODED_PASSWORD = 'letmein123'

export default function LoginForm() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!password.trim()) return

        setLoading(true)
        setError(null)
        const attempt = {
            password,
            attemptedAt: serverTimestamp(),
        }

        try {
            // Log every attempt
            await addDoc(collection(db, 'passwordAttempts'), attempt)
        } catch (err) {
            console.error('Error logging attempt:', err)
        }

        if (password === HARD_CODED_PASSWORD) {
            // Optionally log successful access
            try {
                await addDoc(collection(db, 'passwordAttempts'), {
                    password,
                    attemptedAt: serverTimestamp(),
                    success: true,
                })
            } catch (err) {
                console.error('Error logging success:', err)
            }
            setLoading(false)
            navigate('/home')
        } else {
            setLoading(false)
            setError('Invalid password')
        }
    }

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-title">Login</h2>

            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
            </button>

            {error && <p className="error-msg">{error}</p>}
        </form>
    )
}