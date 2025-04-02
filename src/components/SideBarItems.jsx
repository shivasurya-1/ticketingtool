import SideItem from './SideItem';

const SideBarItems = () => {
    return (
        <div className="  bg-[#306EBF] w-[448px] min-h-full p-4 text-white rounded-r-lg ">
            <div className=' my-8 pl-3'>

                <SideItem title="My Recent Items" apiUrl={process.env.REACT_APP_RECENT_ITEMS_API} />
                <SideItem title="Popular Items" apiUrl={process.env.REACT_APP_POPULAR_ITEMS_API} />
                <SideItem title="Announcements" apiUrl={process.env.REACT_APP_ANNOUNCEMENTS_API} />
                <SideItem title="My Open Items" apiUrl={process.env.REACT_APP_OPEN_ITEMS_API} />
                <SideItem title="Appreciations" apiUrl={process.env.REACT_APP_APPRECIATIONS_API} />
            </div>

        </div>
    );
};

export default SideBarItems;
