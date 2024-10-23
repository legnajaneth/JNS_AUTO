import React from 'react';
import logo from './logo.svg';
import './App.css';
import NavigationBar from './components/navigationBar.jsx';
import ServicePage from './components/services.jsx';
import HomePage from './components/homePage.jsx';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <header>
      JNS
    </header>
    <body>
      <Router>
        <NavigationBar/>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path= "/services" element={<ServicePage/>} />
          </Routes>
      </Router>
    </body>
     </div>
  );
}

export default App;
