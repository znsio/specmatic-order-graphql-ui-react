import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FindOffersForDate = () => {
  const [date, setDate] = useState('');
  const [offers, setOffers] = useState(null);

  const formatDateString = (dateString) => {
    return dateString.replace(/-/g, '/'); 
  };
  
  const FIND_OFFERS_FOR_DATE = gql`
    query {
      findOffersForDate(date: "${formatDateString(date)}") {
        offerCode
        validUntil
      }
    }
  `;

  const [findOffersForDate, { loading }] = useLazyQuery(FIND_OFFERS_FOR_DATE, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setOffers(data.findOffersForDate);
    },
    onError: () => {
      setOffers(null);
      toast.error('Error fetching offers');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Date.parse(date)) {
      toast.dismiss();
      toast.error('Please enter a valid date');
      return;
    }
    
    findOffersForDate({ variables: { date } });
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Find offers valid until a certain date</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            data-testid="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            data-testid="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading && 'opacity-50 cursor-not-allowed'}`}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      {offers && offers.map(offer => {
        return (<>
          <div className="mt-8">
            <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
              <p><strong>Offer code:</strong> {offer.offerCode}</p>
              <p><strong>Valid Until:</strong> {new Date(offer.validUntil).toLocaleDateString()}</p>
            </div>
          </div>
          </>
        )
      })
      }
    </div>
  );
};

export default FindOffersForDate;

