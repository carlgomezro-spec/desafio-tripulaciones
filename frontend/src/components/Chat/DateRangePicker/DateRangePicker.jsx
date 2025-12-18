import { useState } from "react";

import "./DateRangePicker.css";

const DateRangePicker = ({ onConfirm }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="date-picker">
      <input
        type="date"
        value={from}
        onChange={e => setFrom(e.target.value)}
      />
      <input
        type="date"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <button
        disabled={!from || !to}
        onClick={() => onConfirm({ from, to })}
      >
        Confirmar
      </button>
    </div>
  );
};

export default DateRangePicker;
