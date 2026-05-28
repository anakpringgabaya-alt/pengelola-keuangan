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

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions")
    return saved ? JSON.parse(saved) : []
  })

  const [showForm, setShowForm] = useState(false)

  const [editingIndex, setEditingIndex] = useState(null)

  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")

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

    if (editingIndex !== null) {
      const updated = [...transactions]
      updated[editingIndex] = newData
      setTransactions(updated)
      setEditingIndex(null)
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
    if (confirm("Hapus transaksi?")) {
      const updated = transactions.filter(
        (_, i) => i !== index
      )

      setTransactions(updated)
    }
  }

  const editTransaction = (index) => {
    setForm(transactions[index])
    setEditingIndex(index)
    setShowForm(true)
  }

  const filteredTransactions = transactions.filter((item) => {
    if (!filterStart && !filterEnd) return true

    const itemDate = new Date(item.date)

    if (filterStart && itemDate < new Date(filterStart))
      return false

    if (filterEnd && itemDate > new Date(filterEnd))
      return false

    return true
  })

  const income = filteredTransactions
    .filter((item) => item.type === "Income")
    .reduce((a, b) => a + b.amount, 0)

  const expense = filteredTransactions
    .filter((item) => item.type === "Expense")
    .reduce((a, b) => a + b.amount, 0)

  const balance = income - expense

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredTransactions
    )

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Transaksi"
    )

    XLSX.writeFile(workbook, "keuangan.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()

    doc.text("Laporan Keuangan", 14, 15)

    autoTable(doc, {
      head: [
        [
          "Tanggal",
          "Tipe",
          "Kategori",
          "Detail",
          "Nominal",
        ],
      ],
      body: filteredTransactions.map((item) => [
        item.date,
        item.type,
        item.category,
        item.detail,
        `Rp ${item.amount.toLocaleString()}`,
      ]),
    })

    doc.save("laporan-keuangan.pdf")
  }

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

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-black"
      }`}
    >
      <div className="flex flex-col lg:flex-row">

        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-blue-900 text-white p-6">

          <h1 className="text-3xl font-bold mb-8">
            Pengelola Keuangan
          </h1>

          <div className="bg-white/10 rounded-2xl p-5 mb-6">

            <h2 className="text-lg font-semibold mb-4">
              Summary
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-sm opacity-70">
                  Income
                </p>

                <h3 className="text-2xl font-bold text-green-300">
                  Rp {income.toLocaleString()}
                </h3>
              </div>

              <div>
                <p className="text-sm opacity-70">
                  Expense
                </p>

                <h3 className="text-2xl font-bold text-red-300">
                  Rp {expense.toLocaleString()}
                </h3>
              </div>

              <div>
                <p className="text-sm opacity-70">
                  Balance
                </p>

                <h3 className="text-3xl font-bold">
                  Rp {balance.toLocaleString()}
                </h3>
              </div>

            </div>

          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-white text-blue-900 font-semibold py-3 rounded-xl hover:bg-slate-200 transition"
          >
            + Tambah Transaksi
          </button>

          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="w-full mt-4 bg-black/30 py-3 rounded-xl"
          >
            {darkMode
              ? "☀ Light Mode"
              : "🌙 Dark Mode"}
          </button>

        </aside>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto">

          {/* Header */}
          <div className={`rounded-3xl shadow-lg p-5 mb-6 ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}>

            <div className="flex flex-col lg:flex-row justify-between gap-4">

              <div>
                <h2 className="text-3xl font-bold">
                  Dashboard
                </h2>

                <p className="text-slate-500">
                  Kelola pemasukan &
                  pengeluaran
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
                  className="border rounded-xl px-4 py-2 text-black"
                />

                <input
                  type="date"
                  value={filterEnd}
                  onChange={(e) =>
                    setFilterEnd(
                      e.target.value
                    )
                  }
                  className="border rounded-xl px-4 py-2 text-black"
                />

                <button
                  onClick={exportExcel}
                  className="bg-green-600 text-white px-4 rounded-xl"
                >
                  Export Excel
                </button>

                <button
                  onClick={exportPDF}
                  className="bg-red-600 text-white px-4 rounded-xl"
                >
                  Export PDF
                </button>

              </div>

            </div>

          </div>

          {/* Form */}
          {showForm && (

            <div className={`rounded-3xl shadow-lg p-6 mb-6 ${
              darkMode
                ? "bg-slate-800"
                : "bg-white"
            }`}>

              <h3 className="text-2xl font-bold mb-5">
                {editingIndex !== null
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
                      date:
                        e.target.value,
                    })
                  }
                  className="border rounded-xl px-4 py-3 text-black"
                />

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type:
                        e.target.value,
                      category: "",
                    })
                  }
                  className="border rounded-xl px-4 py-3 text-black"
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
                      category:
                        e.target.value,
                    })
                  }
                  className="border rounded-xl px-4 py-3 text-black"
                >
                  <option value="">
                    Pilih Kategori
                  </option>

                  {form.type ===
                  "Income" ? (
                    <>
                      <option>
                        Gaji
                      </option>

                      <option>
                        Bonus
                      </option>

                      <option>
                        Freelance
                      </option>
                    </>
                  ) : (
                    <>
                      <option>
                        Makan
                      </option>

                      <option>
                        Transport
                      </option>

                      <option>
                        Belanja
                      </option>

                      <option>
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
                      detail:
                        e.target.value,
                    })
                  }
                  className="border rounded-xl px-4 py-3 text-black"
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
                  className="border rounded-xl px-4 py-3 text-black"
                />

              </div>

              <button
                onClick={addTransaction}
                className="mt-5 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl"
              >
                {editingIndex !== null
                  ? "Update"
                  : "Simpan"}
              </button>

            </div>

          )}

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            <div className="bg-green-500 text-white p-6 rounded-3xl shadow-lg">
              <p className="text-lg">
                Income
              </p>

              <h3 className="text-4xl font-bold mt-3">
                Rp {(income / 1000000).toFixed(1)} JT
              </h3>
            </div>

            <div className="bg-red-500 text-white p-6 rounded-3xl shadow-lg">
              <p className="text-lg">
                Expense
              </p>

              <h3 className="text-4xl font-bold mt-3">
                Rp {(expense / 1000000).toFixed(1)} JT
              </h3>
            </div>

            <div className="bg-blue-700 text-white p-6 rounded-3xl shadow-lg">
              <p className="text-lg">
                Balance
              </p>

              <h3 className="text-4xl font-bold mt-3">
                Rp {(balance / 1000000).toFixed(1)} JT
              </h3>
            </div>

          </div>

          {/* Chart */}
          <div className={`rounded-3xl shadow-lg p-6 mb-6 ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}>

            <h3 className="text-2xl font-bold mb-4">
              Grafik Keuangan
            </h3>

            <div className="w-full h-80">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="total"
                    fill="#2563eb"
                    radius={[10, 10, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* Table */}
          <div className={`rounded-3xl shadow-lg overflow-x-auto ${
            darkMode
              ? "bg-slate-800"
              : "bg-white"
          }`}>

            <table className="w-full min-w-[700px]">

              <thead className="bg-slate-200 text-black">

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
                      className="border-b"
                    >

                      <td className="p-4">
                        {item.date}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.type ===
                            "Income"
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

                      <td className="p-4 font-bold">
                        Rp{" "}
                        {item.amount.toLocaleString()}
                      </td>

                      <td className="p-4 flex gap-2">

                        <button
                          onClick={() =>
                            editTransaction(
                              index
                            )
                          }
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTransaction(
                              index
                            )
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded-lg"
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