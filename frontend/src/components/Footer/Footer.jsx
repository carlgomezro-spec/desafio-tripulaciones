import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} MediaMarkt · Intranet Corporativa</p>
    </footer>
  );
};

export default Footer;
