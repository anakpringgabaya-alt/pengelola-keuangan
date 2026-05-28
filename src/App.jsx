import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  initializeApp,
} from "firebase/app"

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore"

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyBdsZo8WQ7N1iI3KaFjrCFBFDy0dfKNcoQ",
  authDomain:
    "pengelola-keuangan-1d08c.firebaseapp.com",
  projectId:
    "pengelola-keuangan-1d08c",
  storageBucket:
    "pengelola-keuangan-1d08c.firebasestorage.app",
  messagingSenderId:
    "894218479241",
  appId:
    "1:894218479241:web:3e69b9053eb0dae607c858",
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const db = getFirestore(app)

const provider = new GoogleAuthProvider()

export default function App() {

  const [user, setUser] =
    useState(null)

  const [transactions,
    setTransactions] =
    useState([])

  const [showForm,
    setShowForm] =
    useState(false)

  const [editingId,
    setEditingId] =
    useState(null)

  const [darkMode,
    setDarkMode] =
    useState(false)

  const [filterStart,
    setFilterStart] =
    useState("")

  const [filterEnd,
    setFilterEnd] =
    useState("")

  const [form, setForm] =
    useState({
      date: "",
      type: "Income",
      category: "",
      detail: "",
      amount: "",
    })

  /* ================= LOGIN ================= */

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(currentUser)
        }
      )

    return () => unsubscribe()

  }, [])

  const loginGoogle =
    async () => {

      await signInWithPopup(
        auth,
        provider
      )
    }

  const logout =
    async () => {

      await signOut(auth)
    }

  /* ================= LOAD FIRESTORE ================= */

  useEffect(() => {

    if (!user) return

    const q = query(
      collection(db, "transactions"),
      where(
        "uid",
        "==",
        user.uid
      )
    )

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          )

        setTransactions(data)
      })

    return () => unsubscribe()

  }, [user])

  /* ================= ADD / UPDATE ================= */

  const saveTransaction =
    async () => {

      if (
        !form.date ||
        !form.category ||
        !form.detail ||
        !form.amount
      ) {

        alert(
          "Lengkapi data"
        )

        return
      }

      const data = {
        ...form,
        amount:
          Number(form.amount),
        uid: user.uid,
      }

      if (editingId) {

        await updateDoc(
          doc(
            db,
            "transactions",
            editingId
          ),
          data
        )

        setEditingId(null)

      } else {

        await addDoc(
          collection(
            db,
            "transactions"
          ),
          data
        )
      }

      setForm({
        date: "",
        type: "Income",
        category: "",
        detail: "",
        amount: "",
      })

      setShowForm(false)
    }

  /* ================= DELETE ================= */

  const deleteTransaction =
    async (id) => {

      if (
        confirm(
          "Hapus transaksi?"
        )
      ) {

        await deleteDoc(
          doc(
            db,
            "transactions",
            id
          )
        )
      }
    }

  /* ================= EDIT ================= */

  const editTransaction =
    (item) => {

      setEditingId(item.id)

      setForm(item)

      setShowForm(true)
    }

  /* ================= FILTER ================= */

  const filteredTransactions =
    transactions.filter(
      (item) => {

        if (
          !filterStart &&
          !filterEnd
        ) return true

        const itemDate =
          new Date(item.date)

        if (
          filterStart &&
          itemDate <
          new Date(filterStart)
        ) return false

        if (
          filterEnd &&
          itemDate >
          new Date(filterEnd)
        ) return false

        return true
      }
    )

  /* ================= SUMMARY ================= */

  const income =
    filteredTransactions
      .filter(
        (item) =>
          item.type ===
          "Income"
      )
      .reduce(
        (a, b) =>
          a + b.amount,
        0
      )

  const expense =
    filteredTransactions
      .filter(
        (item) =>
          item.type ===
          "Expense"
      )
      .reduce(
        (a, b) =>
          a + b.amount,
        0
      )

  const balance =
    income - expense

  /* ================= EXPORT EXCEL ================= */

  const exportExcel =
    () => {

      const worksheet =
        XLSX.utils.json_to_sheet(
          filteredTransactions
        )

      const workbook =
        XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Keuangan"
      )

      XLSX.writeFile(
        workbook,
        "keuangan.xlsx"
      )
    }

  /* ================= EXPORT PDF ================= */

  const exportPDF =
    () => {

      const pdf =
        new jsPDF()

      pdf.text(
        "Laporan Keuangan",
        14,
        15
      )

      autoTable(pdf, {
        head: [[
          "Tanggal",
          "Tipe",
          "Kategori",
          "Detail",
          "Nominal",
        ]],

        body:
          filteredTransactions.map(
            (item) => [
              item.date,
              item.type,
              item.category,
              item.detail,
              `Rp ${item.amount.toLocaleString()}`,
            ]
          ),
      })

      pdf.save(
        "laporan-keuangan.pdf"
      )
    }

  /* ================= CHART ================= */

  const chartData = [
    {
      name: "Income",
      total: income,
    },
    {
      name: "Expense",
      total: expense,
    },
  ]

  /* ================= LOGIN PAGE ================= */

  if (!user) {

    return (

      <div className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center w-full max-w-md">

          <h1 className="text-4xl font-bold mb-4 text-blue-900">
            Pengelola Keuangan
          </h1>

          <p className="text-slate-500 mb-8">
            Login menggunakan Google
          </p>

          <button
            onClick={loginGoogle}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-2xl font-semibold"
          >
            Login Google
          </button>

        </div>

      </div>
    )
  }

  /* ================= MAIN APP ================= */

  return (

    <div className={`min-h-screen ${
      darkMode
        ? "bg-slate-900 text-white"
        : "bg-slate-100 text-black"
    }`}>

      <div className="flex flex-col lg:flex-row">

        {/* SIDEBAR */}

        <aside className="w-full lg:w-72 bg-blue-900 text-white p-6">

          <h1 className="text-4xl font-bold mb-8">
            Pengelola Keuangan
          </h1>

          <div className="mb-8">

            <img
              src={user.photoURL}
              alt=""
              className="w-16 h-16 rounded-full mb-3"
            />

            <h2 className="font-bold text-xl">
              {user.displayName}
            </h2>

            <p className="text-sm opacity-70">
              {user.email}
            </p>

          </div>

          <div className="bg-white/10 rounded-3xl p-5 mb-6">

            <h2 className="text-xl font-bold mb-5">
              Summary
            </h2>

            <div className="space-y-5">

              <div>

                <p className="opacity-70">
                  Income
                </p>

                <h3 className="text-3xl font-bold text-green-300">
                  Rp {income.toLocaleString()}
                </h3>

              </div>

              <div>

                <p className="opacity-70">
                  Expense
                </p>

                <h3 className="text-3xl font-bold text-red-300">
                  Rp {expense.toLocaleString()}
                </h3>

              </div>

              <div>

                <p className="opacity-70">
                  Balance
                </p>

                <h3 className="text-4xl font-bold">
                  Rp {balance.toLocaleString()}
                </h3>

              </div>

            </div>

          </div>

          <button
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
            className="w-full bg-white text-blue-900 py-4 rounded-2xl font-bold mb-4"
          >
            + Tambah Transaksi
          </button>

          <button
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
            className="w-full bg-indigo-950 py-4 rounded-2xl mb-4"
          >
            🌙 Dark Mode
          </button>

          <button
            onClick={logout}
            className="w-full bg-red-600 py-4 rounded-2xl"
          >
            Logout
          </button>

        </aside>

        {/* MAIN */}

        <main className="flex-1 p-6">

          {/* HEADER */}

          <div className={`rounded-3xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}>

            <div className="flex flex-col lg:flex-row justify-between gap-4">

              <div>

                <h2 className="text-4xl font-bold">
                  Dashboard
                </h2>

                <p className="text-slate-500">
                  Kelola pemasukan & pengeluaran
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <input
                  type="date"
                  value={filterStart}
                  onChange={(e) =>
                    setFilterStart(
                      e.target.value
                    )
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                />

                <input
                  type="date"
                  value={filterEnd}
                  onChange={(e) =>
                    setFilterEnd(
                      e.target.value
                    )
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                />

                <button
                  onClick={exportExcel}
                  className="bg-green-500 text-white px-5 rounded-2xl"
                >
                  Export Excel
                </button>

                <button
                  onClick={exportPDF}
                  className="bg-red-500 text-white px-5 rounded-2xl"
                >
                  Export PDF
                </button>

              </div>

            </div>

          </div>

          {/* FORM */}

          {showForm && (

            <div className={`rounded-3xl p-6 shadow-lg mb-6 ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}>

              <h2 className="text-3xl font-bold mb-6">

                {editingId
                  ? "Edit Transaksi"
                  : "Tambah Transaksi"}

              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date:
                        e.target.value,
                    })
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                />

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type:
                        e.target.value,
                    })
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                >
                  <option>
                    Income
                  </option>

                  <option>
                    Expense
                  </option>
                </select>

                <input
                  type="text"
                  placeholder="Kategori"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                />

                <input
                  type="text"
                  placeholder="Detail"
                  value={form.detail}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      detail:
                        e.target.value,
                    })
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                />

                <input
                  type="number"
                  placeholder="Nominal"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount:
                        e.target.value,
                    })
                  }
                  className="border rounded-2xl px-4 py-3 text-black"
                />

              </div>

              <button
                onClick={saveTransaction}
                className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-2xl"
              >
                {editingId
                  ? "Update"
                  : "Simpan"}
              </button>

            </div>

          )}

          {/* CHART */}

          <div className={`rounded-3xl p-6 shadow-lg mb-6 ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}>

            <h2 className="text-3xl font-bold mb-5">
              Grafik Keuangan
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="total"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* TABLE */}

          <div className={`rounded-3xl p-6 shadow-lg overflow-x-auto ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}>

            <table className="w-full">

              <thead>

                <tr className="border-b">

                  <th className="text-left p-3">
                    Tanggal
                  </th>

                  <th className="text-left p-3">
                    Tipe
                  </th>

                  <th className="text-left p-3">
                    Kategori
                  </th>

                  <th className="text-left p-3">
                    Detail
                  </th>

                  <th className="text-left p-3">
                    Nominal
                  </th>

                  <th className="text-left p-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredTransactions.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-b"
                    >

                      <td className="p-3">
                        {item.date}
                      </td>

                      <td className="p-3">
                        {item.type}
                      </td>

                      <td className="p-3">
                        {item.category}
                      </td>

                      <td className="p-3">
                        {item.detail}
                      </td>

                      <td className="p-3">
                        Rp {item.amount.toLocaleString()}
                      </td>

                      <td className="p-3 flex gap-2">

                        <button
                          onClick={() =>
                            editTransaction(
                              item
                            )
                          }
                          className="bg-yellow-500 text-white px-3 py-1 rounded-xl"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTransaction(
                              item.id
                            )
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded-xl"
                        >
                          Hapus
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </main>

      </div>

    </div>
  )
}