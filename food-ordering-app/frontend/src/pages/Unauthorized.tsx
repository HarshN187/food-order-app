import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">403</h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Unauthorized Access
        </p>
        <p className="mt-4 text-gray-500">
          You do not have permission to view this page.
        </p>
        <button
          onClick={() => navigate('/restaurants')}
          className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Go to Restaurants
        </button>
      </div>
    </div>
  );
};
