// import App from './App.jsx'; //js file for idk yet.. basta pwede ihiwalay i guess? like, routing and logic?
// import React from 'react';
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from 'react-router-dom';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<BrowserRouter><App /></BrowserRouter>);

// // ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'))
// //createRoot(document.getElementById('root')).render(<App />);
import React from 'react';
import App from './App.jsx'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';

import './css/styles.css';
import './css/register-ts.css';
import './css/exam-create-t.css';
import './css/home-t.css';
import './css/home-s.css';
import './css/score-exam-s.css';
import './css/exam-instr-s.css';
import './css/exam-ques-types-s.css';
import './css/register-s.css';
import './css/login.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <BrowserRouter >
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
  );