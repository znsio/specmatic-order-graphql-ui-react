import './App.css';
import FindAvailableProductForm from './components/FindAvailableProductForm';
import ProductForm from './components/ProductForm';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect } from 'react';
import FindOffersForDate from './components/FindOffersForDate';
import FindOffersAndProducts from './components/FindOffersAndProducts';

function App() {
  
  useEffect(() => {
    const handleDocumentClick = () => {
      toast.dismiss();
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <div className="App">
      <br/>
      <ProductForm/>
      <br/>
      <br/>
      <FindAvailableProductForm/>
      <br/>
      <FindOffersForDate/>
      <br/>
      <br/>
      <FindOffersAndProducts/>
      <br/>
      <ToastContainer />
    </div>
  );
}

export default App;
