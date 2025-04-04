const Card = ({ title, description, icon, className, onClick }) => {
  return (
    <div className={`bg-white p-6 rounded-lg w-80 shadow-xl text-center relative h-44 ${className}`}
    onClick={onClick}
    >
      <div className="w-16 h-16 bg-[#224d86] rounded-full flex items-center justify-center mx-auto mb-4 -mt-12">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#093d80] mb-2">{title}</h3>
      <p className="text-black text-sm max-w-[220px] mx-auto">
        {description}
      </p>
    </div>
  );
};

export default Card;
