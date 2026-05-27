import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

import { auth } from "./firebase"
import { signOut } from "firebase/auth"

export default function App() {
  const [showForm, setShowForm] = useState(false)

  const [editIndex, setEditIndex] = useState(null)

  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions")
    return saved ? JSON.parse(saved) : []
  })

  const [form, setForm] = useState({
    date: "",
    type: "Income",
    category: "",
    detail: "",
    amount: "",
  })

  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    )
  }, [transactions])

  const income = transactions
    .filter((item) => item.type === "Income")
    .reduce((a, b) => a + b.amount, 0)

  const expense = transactions
    .filter((item) => item.type === "Expense")
    .reduce((a, b) => a + b.amount, 0)

  const balance = income - expense

  const addTransaction = () => {
    if (
      !form.date ||
      !form.category ||
      !form.detail ||
      !form.amount
    ) {
      alert("Lengkapi data")
      return
    }

    const newData = {
      ...form,
      amount: Number(form.amount),
    }

    if (editIndex !== null) {
      const updated = [...transactions]
      updated[editIndex] = newData
      setTransactions(updated)
      setEditIndex(null)
    } else {
      setTransactions([...transactions, newData])
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

  const deleteTransaction = (index) => {
    const updated = transactions.filter(
      (_, i) => i !== index
    )

    setTransactions(updated)
  }

  const editTransaction = (index) => {
    setForm(transactions[index])
    setEditIndex(index)
    setShowForm(true)
  }

  const filteredTransactions = transactions.filter((item) => {
    if (!filterStart || !filterEnd) return true

    return (
      item.date >= filterStart &&
      item.date <= filterEnd
    )
  })

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

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      transactions
    )

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Transaksi"
    )

    XLSX.writeFile(workbook, "transaksi.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()

    doc.text("Laporan Transaksi", 14, 15)

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Tanggal",
          "Tipe",
          "Kategori",
          "Detail",
          "Nominal",
        ],
      ],
      body: transactions.map((item) => [
        item.date,
        item.type,
        item.category,
        item.detail,
        `Rp ${item.amount.toLocaleString()}`,
      ]),
    })

    doc.save("laporan.pdf")
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">

      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-blue-900 text-white p-6">

        <h1 className="text-4xl font-bold mb-8">
          Pengelola Keuangan
        </h1>

        <div className="bg-white/10 rounded-3xl p-5 mb-6">

          <h2 className="text-xl font-semibold mb-5">
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
          onClick={() => {
            setShowForm(!showForm)
            setEditIndex(null)
          }}
          className="w-full bg-white text-blue-900 font-bold py-3 rounded-2xl mb-4 hover:bg-slate-200"
        >
          + Tambah Transaksi
        </button>

        <button
          onClick={() => signOut(auth)}
          className="w-full bg-red-500 py-3 rounded-2xl font-bold"
        >
          Logout
        </button>

      </aside>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-6">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">

          <h2 className="text-4xl font-bold">
            Dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            Kelola pemasukan & pengeluaran
          </p>

          <p className="text-sm text-slate-400 mt-2">
            Login sebagai: {auth.currentUser?.email}
          </p>

        </div>

        {/* Filter */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">

          <div className="flex flex-col lg:flex-row gap-3">

            <input
              type="date"
              value={filterStart}
              onChange={(e) =>
                setFilterStart(e.target.value)
              }
              className="border px-4 py-3 rounded-2xl"
            />

            <input
              type="date"
              value={filterEnd}
              onChange={(e) =>
                setFilterEnd(e.target.value)
              }
              className="border px-4 py-3 rounded-2xl"
            />

          </div>

          <div className="flex gap-3">

            <button
              onClick={exportExcel}
              className="bg-green-600 text-white px-5 py-3 rounded-2xl"
            >
              Export Excel
            </button>

            <button
              onClick={exportPDF}
              className="bg-red-600 text-white px-5 py-3 rounded-2xl"
            >
              Export PDF
            </button>

          </div>

        </div>

        {/* Form */}
        {showForm && (

          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">

            <h3 className="text-2xl font-bold mb-5">
              {editIndex !== null
                ? "Edit Transaksi"
                : "Tambah Transaksi"}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
                className="border rounded-2xl px-4 py-3"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    category: "",
                  })
                }
                className="border rounded-2xl px-4 py-3"
              >
                <option>
                  Income
                </option>

                <option>
                  Expense
                </option>

              </select>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="border rounded-2xl px-4 py-3"
              >

                <option value="">
                  Pilih Kategori
                </option>

                {form.type === "Income" ? (
                  <>
                    <option value="Gaji">
                      Gaji
                    </option>

                    <option value="Bonus">
                      Bonus
                    </option>

                    <option value="Freelance">
                      Freelance
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Makan">
                      Makan
                    </option>

                    <option value="Transport">
                      Transport
                    </option>

                    <option value="Belanja">
                      Belanja
                    </option>

                    <option value="Tagihan">
                      Tagihan
                    </option>
                  </>
                )}

              </select>

              <input
                type="text"
                placeholder="Detail"
                value={form.detail}
                onChange={(e) =>
                  setForm({
                    ...form,
                    detail: e.target.value,
                  })
                }
                className="border rounded-2xl px-4 py-3"
              />

              <input
                type="number"
                placeholder="Nominal"
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
                className="border rounded-2xl px-4 py-3"
              />

            </div>

            <button
              onClick={addTransaction}
              className="mt-5 bg-blue-700 text-white px-6 py-3 rounded-2xl"
            >
              Simpan
            </button>

          </div>

        )}

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <div className="bg-green-500 text-white p-6 rounded-3xl shadow-lg">

            <p className="text-lg">
              Income
            </p>

            <h3 className="text-5xl font-bold mt-3">
              Rp {(income / 1000000).toFixed(1)} JT
            </h3>

          </div>

          <div className="bg-red-500 text-white p-6 rounded-3xl shadow-lg">

            <p className="text-lg">
              Expense
            </p>

            <h3 className="text-5xl font-bold mt-3">
              Rp {(expense / 1000000).toFixed(1)} JT
            </h3>

          </div>

          <div className="bg-blue-700 text-white p-6 rounded-3xl shadow-lg">

            <p className="text-lg">
              Balance
            </p>

            <h3 className="text-5xl font-bold mt-3">
              Rp {(balance / 1000000).toFixed(1)} JT
            </h3>

          </div>

        </div>

        {/* Grafik */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">

          <h3 className="text-3xl font-bold mb-6">
            Grafik Keuangan
          </h3>

          <div className="w-full h-[300px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="total"
                  fill="#4338ca"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="text-left p-4">
                  Tanggal
                </th>

                <th className="text-left p-4">
                  Tipe
                </th>

                <th className="text-left p-4">
                  Kategori
                </th>

                <th className="text-left p-4">
                  Detail
                </th>

                <th className="text-left p-4">
                  Nominal
                </th>

                <th className="text-left p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredTransactions.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-4">
                      {item.date}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.type === "Income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td className="p-4">
                      {item.category}
                    </td>

                    <td className="p-4">
                      {item.detail}
                    </td>

                    <td
                      className={`p-4 font-bold ${
                        item.type === "Income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Rp {item.amount.toLocaleString()}
                    </td>

                    <td className="p-4 flex gap-2">

                      <button
                        onClick={() =>
                          editTransaction(index)
                        }
                        className="bg-yellow-400 px-4 py-2 rounded-xl"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteTransaction(index)
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded-xl"
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
  )
}