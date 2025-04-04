import SideItem from './SideItem';

const SideBarItems = () => {
    return (
        <div className="  bg-[#306EBF] w-[448px] min-h-full p-4 text-white rounded-r-lg ">
            <div className=' my-8 pl-3'>

                <SideItem title="My Recent Items" apiUrl="https://api.example.com/recent-items" />
                <SideItem title="Popular Items" apiUrl="https://api.example.com/popular-items" />
                <SideItem title="Announcements" apiUrl="https://api.example.com/announcements" />
                <SideItem title="My Open Items" apiUrl="https://api.example.com/popular-items" />
                <SideItem title="Appreciations" apiUrl="https://api.example.com/announcements" />
            </div>

        </div>
    );
};

export default SideBarItems;
