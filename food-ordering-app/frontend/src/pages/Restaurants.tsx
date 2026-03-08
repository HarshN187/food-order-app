import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../api/restaurants.api';
import type { Restaurant } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { MapPin, ChefHat } from 'lucide-react';

export const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err: any) {
      setError('Failed to fetch restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Restaurants</h1>
          <p className="mt-2 text-sm text-gray-700">Choose a restaurant to view its menu and place an order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100 cursor-pointer border border-slate-50"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <ChefHat className="h-6 w-6" />
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${restaurant.country?.code === 'IN'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-rose-50 text-rose-700'
                  }`}>
                  {restaurant.country?.name}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                {restaurant.name}
              </h3>
              
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{restaurant.cuisineType || 'General'}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </p>
              </div>
            </div>
            
            <div className="mt-auto border-t border-slate-50 px-8 py-4 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors">
              <span className="text-sm font-semibold text-indigo-600">View Menu &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
