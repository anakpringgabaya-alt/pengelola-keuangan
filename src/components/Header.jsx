export default function Header({
  exportExcel,
  exportPDF,
}) {

  return (

    <div className="bg-white rounded-3xl shadow-lg p-5 mb-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="text-slate-500">
            Kelola pemasukan & pengeluaran
          </p>

        </div>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl"
          >
            Export Excel
          </button>

          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl"
          >
            Export PDF
          </button>

        </div>

      </div>

    </div>
  )
}