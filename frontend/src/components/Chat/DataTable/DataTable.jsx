import "./DataTable.css";

const exportCSV = (headers, rows) => {
  const csv =
    [headers.join(",")]
      .concat(rows.map(r => r.join(",")))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "data.csv";
  a.click();
};

const DataTable = ({ headers, rows }) => {
  return (
    <div className="chat-table-wrapper">
      <button
        className="export-btn"
        onClick={() => exportCSV(headers, rows)}
      >
        ⬇ Exportar CSV
      </button>

      <table className="chat-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
