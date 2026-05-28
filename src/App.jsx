import { useEffect, useState } from "react";
import "./index.css";

import { auth, provider, db } from "./firebase";

import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  ref,
  push,
  onValue,
  remove,
  update,
} from "firebase/database";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [user, setUser] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState({
    date: "",
    type: "Income",
    category: "",
    detail: "",
    amount: "",
  });

  const [editingId, setEditingId] = useState(null);

  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // LOGIN FIREBASE
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // LOAD DATA FIREBASE
  useEffect(() => {
    const transaksiRef = ref(db, "transactions");

    onValue(transaksiRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const loadedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setTransactions(loadedData);
      } else {
        setTransactions([]);
      }
    });
  }, []);

  // LOGIN
  const loginGoogle = async () => {
    await signInWithPopup(auth, provider);
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
  };

  // SIMPAN TRANSAKSI
  const saveTransaction = () => {
    if (
      !form.date ||
      !form.category ||
      !form.amount
    ) {
      alert("Lengkapi data");
      return;
    }

    if (editingId) {
      update(ref(db, `transactions/${editingId}`), form);

      setEditingId(null);
    } else {
      push(ref(db, "transactions"), form);
    }

    setForm({
      date: "",
      type: "Income",
      category: "",
      detail: "",
      amount: "",
    });
  };

  // HAPUS
  const deleteTransaction = (id) => {
    remove(ref(db, `transactions/${id}`));
  };

  // EDIT
  const editTransaction = (item) => {
    setForm({
      date: item.date,
      type: item.type,
      category: item.category,
      detail: item.detail,
      amount: item.amount,
    });

    setEditingId(item.id);
  };

  // FILTER
  const filteredTransactions = transactions.filter((item) => {
    if (!filterStart || !filterEnd) return true;

    return (
      item.date >= filterStart &&
      item.date <= filterEnd
    );
  });

  // SUMMARY
  const income = filteredTransactions
    .filter((t) => t.type === "Income")
    .reduce((a, b) => a + Number(b.amount), 0);

  const expense = filteredTransactions
    .filter((t) => t.type === "Expense")
    .reduce((a, b) => a + Number(b.amount), 0);

  const balance = income - expense;

  // EXPORT EXCEL
  const exportExcel = () => {
    const worksheet =
      XLSX.utils.json_to_sheet(filteredTransactions);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Transaksi"
    );

    XLSX.writeFile(
      workbook,
      "pengelola-keuangan.xlsx"
    );
  };

  // EXPORT PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Laporan Keuangan", 14, 10);

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
        item.amount,
      ]),
    });

    doc.save("laporan-keuangan.pdf");
  };

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1>Pengelola Keuangan</h1>

          <button
            className="login-btn"
            onClick={loginGoogle}
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h1>Pengelola Keuangan</h1>

        <div className="profile">
          <img
            src={user.photoURL}
            alt=""
          />

          <h3>{user.displayName}</h3>

          <p>{user.email}</p>
        </div>

        <div className="summary-card">
          <h2>Summary</h2>

          <p>Income</p>
          <h3>Rp {income.toLocaleString()}</h3>

          <p>Expense</p>
          <h3>Rp {expense.toLocaleString()}</h3>

          <p>Balance</p>
          <h3>Rp {balance.toLocaleString()}</h3>
        </div>

        <button
          className="add-btn"
          onClick={() =>
            document
              .getElementById("form")
              .scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          + Tambah Transaksi
        </button>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="content">
        <div className="header">
          <div>
            <h1>Dashboard</h1>
            <p>Kelola pemasukan & pengeluaran</p>
          </div>

          <div className="filter-box">
            <input
              type="date"
              value={filterStart}
              onChange={(e) =>
                setFilterStart(e.target.value)
              }
            />

            <input
              type="date"
              value={filterEnd}
              onChange={(e) =>
                setFilterEnd(e.target.value)
              }
            />

            <button onClick={exportExcel}>
              Export Excel
            </button>

            <button onClick={exportPDF}>
              Export PDF
            </button>
          </div>
        </div>

        {/* FORM */}
        <div
          className="form-box"
          id="form"
        >
          <h2>
            {editingId
              ? "Edit Transaksi"
              : "Tambah Transaksi"}
          </h2>

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          >
            <option>Income</option>
            <option>Expense</option>
          </select>

          <input
            type="text"
            placeholder="Kategori"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />

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
          />

          <button onClick={saveTransaction}>
            {editingId ? "Update" : "Simpan"}
          </button>
        </div>

        {/* CHART */}
        <div className="chart-box">
          <h2>Grafik Keuangan</h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart
              data={[
                {
                  name: "Income",
                  total: income,
                },
                {
                  name: "Expense",
                  total: expense,
                },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TABLE */}
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Detail</th>
                <th>Nominal</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>

                  <td>{item.type}</td>

                  <td>{item.category}</td>

                  <td>{item.detail}</td>

                  <td>
                    Rp{" "}
                    {Number(
                      item.amount
                    ).toLocaleString()}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        editTransaction(item)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTransaction(item.id)
                      }
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;