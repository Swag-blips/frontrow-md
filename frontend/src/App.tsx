import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/components/pages/Home';
import ProductInput from '@/components/pages/ProductInput';
import ProductData from '@/components/pages/ProductData';
import Review from '@/components/pages/Review';
import Processing from '@/components/pages/Processing';
import '@/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product-input" element={<ProductInput />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/product-data" element={<ProductData />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </Router>
  );
}

export default App;
