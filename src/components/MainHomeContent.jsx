import SearchBar from './SearchBar';
import Card from './Card';
import { AlertTriangle, HeartHandshake, BookOpenText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatbotPopup from './ChatBot';

const MainHomeContent = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center bg-[#E3E3E3] text-blue-900 w-full">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl mx-auto font-bold mb-6 p-4 sm:p-10 mt-4 text-[#093D80]">
        How may we assist you?
      </h2>

      <SearchBar className="w-full px-4 sm:px-6 lg:px-10" />

      <div className="flex justify-center mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 px-4 sm:px-6 lg:px-10">
          <Card
            icon={<AlertTriangle className="w-8 h-8 text-white" />}
            title="Report an Issue"
            description="Issues related to applications, infra, VPN etc."
            className="hover:cursor-pointer hover:scale-105 transform duration-300"
            onClick={() => navigate('/request-issue')}
          />

          <Card
            icon={<HeartHandshake className="w-8 h-8 text-white" />}
            title="Raise a Service Request"
            description="Issues related to applications, infra, VPN etc."
            className="hover:cursor-pointer hover:scale-105 transform duration-300"
          />

          <Card
            icon={<BookOpenText className="w-8 h-8 text-white" />}
            title="Knowledge Base"
            description="Issues related to applications, infra, VPN etc."
            className="hover:cursor-pointer hover:scale-105 transform duration-300"
          />
        </div>
      </div>

      <div className=" bottom-0 mt-40 left-0 right-0 py-4 text-center ">
        <p className="text-gray-600">Account locked out?</p>
        <a href="#" className="text-[#293988] font-bold hover:underline">
          Want to reset password?
        </a>
      </div>
      <ChatbotPopup />

    </div>
  );
};

export default MainHomeContent;




/* import SearchBar from './SearchBar';
import Card from './Card';
import { Search, AlertTriangle, Heart, Book, User, BookOpenText, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MainHomeContent = () => {
  const navigate = useNavigate();

  return (
    <div className=" text-center bg-[#E3E3E3] text-blue-900 w-full">

      <h2 className="text-5xl mx-auto font-bold mb-6 p-10 mt-4 text-[#093D80]">How may we assist you?</h2>
      <SearchBar />
      <div className="flex justify-around mt-8">
        <div className="grid grid-cols-3 gap-6 mt-36">

          <Card
            icon={<AlertTriangle className="w-8 h-8 text-white" />}
            title={"Report an Issue"}
            description={" Issues related to applications, infra, VPN etc"}
            className={" hover:cursor-pointer hover:scale-105 transform duration-300"}
            onClick={() => navigate('/request-issue')}
          />
          <Card
            icon={<HeartHandshake className="w-8 h-8 text-white" />}
            title={"Raise a Service Request"}
            description={" Issues related to applications, infra, VPN etc"}
            className={" hover:cursor-pointer hover:scale-105 transform duration-300"}

          />

          <Card
            icon={<BookOpenText className="w-8 h-8 text-white" />}
            title={"Knowledge Base"}
            description={" Issues related to applications, infra, VPN etc"}
            className={" hover:cursor-pointer hover:scale-105 transform duration-300"}

          />

        </div>
      </div>

      <div className=" bottom-0 mt-40 left-0 right-0 py-4 text-center ">
        <p className="text-gray-600">Account locked out?</p>
        <a href="#" className="text-[#293988] font-bold hover:underline">Want to reset password?</a>
      </div>




    </div>
  );
};

export default MainHomeContent;
 */


