import { createBrowserRouter, RouterProvider, type FutureConfig } from 'react-router-dom';
import Home from '@/components/pages/Home';
import ProductInput from '@/components/pages/ProductInput';
import ProductData from '@/components/pages/ProductData';
import Review from '@/components/pages/Review';
import Processing from '@/components/pages/Processing';
import '@/App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/product-input',
    element: <ProductInput />,
  },
  {
    path: '/processing',
    element: <Processing />,
  },
  {
    path: '/product-data',
    element: <ProductData />,
  },
  {
    path: '/review/:productId',
    element: <Review />,
  }
], {
  future: {
    v7_normalizeFormMethod: true
  } as Partial<FutureConfig>
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
