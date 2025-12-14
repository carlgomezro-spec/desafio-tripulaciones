import SalesList from "../../Main/MktPage/SalesList/SalesList";
import CustomersList from "../../Main/MktPage/CustomersList/CustomersList";
import ProductsList from "../../Main/MktPage/ProductsList/ProductsList";
import "./MktPage.css";
import ChatBox from "../../Chat/Chatbox/Chatbox";


const MktPage = () => {
  return (
    <section className="mkt-page">
      <header className="mkt-header">
        <h1>📊 Marketing Dashboard</h1>
      </header>

      <SalesList />
      <CustomersList />
      <ProductsList />
      <ChatBox />

    </section>
  );
};

export default MktPage;
