import './App.css';
import './index.css';
import Navbar from './components/navbar/Navbar';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import Shop from './pages/shop/shop';
import Login from './pages/login/login';
import Mint from './pages/mint/mint';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/shop" element={<Shop/>}/>
        <Route path="/mint" element={<Mint/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
