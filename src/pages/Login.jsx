import { useState } from "react"

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"

import { auth } from "../firebase"

export default function Login() {

  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const submit = async () => {

    try {

      if (isLogin) {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        alert("Login berhasil")

      } else {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

        alert("Register berhasil")
      }

    } catch (err) {

      alert(err.message)
    }
  }

  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-4xl font-bold text-center text-blue-900 mb-3">
          Pengelola Keuangan
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Firebase Login System
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            onClick={submit}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl"
          >

            {isLogin
              ? "Login"
              : "Register"}

          </button>

        </div>

        <button
          onClick={() =>
            setIsLogin(!isLogin)
          }
          className="w-full mt-5 text-blue-700"
        >

          {isLogin
            ? "Belum punya akun? Register"
            : "Sudah punya akun? Login"}

        </button>

      </div>

    </div>
  )
}