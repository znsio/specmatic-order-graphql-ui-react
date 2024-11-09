import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FIND_OFFERS_AND_PRODUCTS = gql`
  query FindOffersAndProducts($date: String!, $type: ProductType!, $pageSize: Int!) {
    findOffersForDate(date: $date) {
      offerCode
      validUntil
    }
    findAvailableProducts(type: $type, pageSize: $pageSize) {
      id
      name
      inventory
      type
    }
  }
`;

const FindOffersAndProducts = () => {
  const [date, setDate] = useState('');
  const [type, setType] = useState('gadget');
  const [pageSize, setPageSize] = useState('');
  const [offers, setOffers] = useState(null);
  const [products, setProducts] = useState(null);
  const [queriesExecuted, setQueriesExecuted] = useState(false);

  const [fetchData, { loading }] = useLazyQuery(FIND_OFFERS_AND_PRODUCTS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setOffers(data.findOffersForDate);
      setProducts(data.findAvailableProducts);
    },
    onError: () => toast.error('Error fetching data'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!Date.parse(date)) {
      toast.error('Please enter a valid date');
      return;
    }
    if (isNaN(pageSize) || pageSize <= 0) {
      toast.error('Page size must be a positive number');
      return;
    }

    setQueriesExecuted(true);

    fetchData({
      variables: {
        date: date.replace(/-/g, '/'),
        type,
        pageSize: parseInt(pageSize, 10),
      },
      context: {
        headers: {
          "X-region": "north-west"
        }
      }
    });
  };

  const isProductsValid = () => products && products.length > 0;
  const isOffersValid = () => offers && offers.length > 0;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Find Offers and Products</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date
            </label>
            <input
              type="date"
              id="date"
              data-testid="multi-date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Product Type
            </label>
            <select
              id="type"
              data-testid="multi-type"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="gadget">Gadget</option>
              <option value="book">Book</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pageSize">
              Page Size
            </label>
            <input
              type="number"
              id="pageSize"
              data-testid="multi-pageSize"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="submit"
            data-testid="multi-submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {queriesExecuted && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-4">Offers</h2>
            {isOffersValid() ? (
              offers.map((offer) => (
                <div key={offer.offerCode} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                  <p><strong>Offer Code:</strong> {offer.offerCode}</p>
                  <p><strong>Valid Until:</strong> {new Date(offer.validUntil).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No offers found</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Products</h2>
            {isProductsValid() ? (
              products.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm" data-testid="multi-product">
                  <p><strong>ID:</strong> {product.id}</p>
                  <p><strong>Name:</strong> {product.name}</p>
                  <p><strong>Inventory:</strong> {product.inventory}</p>
                  <p><strong>Type:</strong> {product.type}</p>
                </div>
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindOffersAndProducts;

