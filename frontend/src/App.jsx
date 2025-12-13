import React from "react";
import { BrowserRouter } from 'react-router-dom'

//COMPONENTES CENTRALES
import Header from './components/Header/Header.jsx'
import Main from './components/Main/Main.jsx'
import Footer from './components/Footer/Footer.jsx'

function App() {
  return(
    <>
     <BrowserRouter>
          <Header/>
          <Main/>
          <Footer/>
     </BrowserRouter>
    </>
  )
   
}

export default App;
