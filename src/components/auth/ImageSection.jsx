
import React from 'react';
import login_side_image from '../../assets/login_side_image.jpg' 

const ImageSection = () => {
  return (
    <img
      src={login_side_image}
      alt="Illustration"
      className="object-cover w-full h-full rounded-lg md:rounded-none mx-4 md:mx-12 lg:mx-0"
    />
  );
};

export default ImageSection;
