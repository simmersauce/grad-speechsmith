import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import CreateSpeech from './pages/CreateSpeech';
import Review from './pages/Review';
import Preview from './pages/Preview';
import PaymentSuccess from './pages/PaymentSuccess';
import NotFound from './pages/NotFound';
import EmailTestTool from "./components/payment/EmailTestTool";
import { TEST_MODE } from './utils/testMode';
import EdgeFunctionTester from './pages/EdgeFunctionTester';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateSpeech />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/review" element={<Review />} />
          <Route path="/edge-function-tester" element={<EdgeFunctionTester />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
      {/* Add the email test tool at the bottom of the app, but only in test mode */}
      {TEST_MODE && <EmailTestTool />}
    </Router>
  );
}

export default App;
