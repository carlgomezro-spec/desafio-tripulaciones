import "./SummaryCard.css";

const SummaryCard = ({ title, value }) => {
  return (
    <div className="summary-card">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
};

export default SummaryCard;
