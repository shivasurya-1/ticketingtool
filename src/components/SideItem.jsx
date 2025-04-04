import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItemData } from '../store/Slices/itemsSlice';

const SideItem = ({ title, apiUrl }) => {
  const dispatch = useDispatch();

  // Fetch data when the component mounts
  useEffect(() => {
    dispatch(fetchItemData(apiUrl));
  }, [dispatch, apiUrl]);

  const { itemsData, loading, error } = useSelector((state) => state.items);
  const itemData = itemsData[apiUrl] || [];

  return (
    <div className="bg-white w-[318px] h-[128px] text-center text-black mb-4 rounded-lg  mx-auto shadow-xl ">
      <div className="bg-[#224d86] text-left py-2 px-10 rounded-t-lg">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="p-3 text-sm">
        {loading ? (
          <p>Loading...</p>
        ) : /* error ? (
          <p className="text-red-500 text-left pl-8">{error}</p>
        ) : */ itemData.length > 0 ? (
          <ul className="list-none p-0">
            {itemData.map((item, index) => (
              <li key={index} className="text-center">{item}</li>
            ))}
          </ul>
        ) : (
          <p>No records found</p>
        )}
      </div>
    </div>
  );
};

export default SideItem;
