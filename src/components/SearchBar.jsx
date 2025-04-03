import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = () => {
    return (
      <div className="flex items-center max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter your Query"
          className="flex-1 p-2 border border-gray-300 rounded-l-lg"
        />
        <button className="bg-[#306EBF] w-[60px] h-[#51px] text-white p-2 rounded-r-lg">
          {/* <i className="fas fa-search"></i>
           */}
           <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    );
  };
  
  export default SearchBar;
  