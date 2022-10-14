import React from 'react';
import './App.css';
import 'antd/dist/antd.css';
import CustomCcp from './CustomCcp';

function App() {
  return (
    <div className="App">
      <CustomCcp />
      <div id="container-div" style={{ width: "100%", height: "100%", minHeight: 480, minWidth: 400 }}/>
    </div>
  );
}

export default App;
