import React from 'react';

type MenuIconProps = {
  isSamll?: boolean;
};
const MenuIcon = ({ isSamll }: MenuIconProps) => {
  return isSamll ? (
    <svg
      width="14"
      height="9"
      viewBox="0 0 14 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line y1="1" x2="14" y2="1" stroke="white" strokeWidth="2" />
      <line y1="4.5" x2="14" y2="4.5" stroke="white" strokeWidth="2" />
      <line y1="8" x2="14" y2="8" stroke="white" strokeWidth="2" />
    </svg>
  ) : (
    <svg
      width="20"
      height="12"
      viewBox="0 0 20 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line y1="1" x2="20" y2="1" stroke="white" strokeWidth="2" />
      <line y1="6" x2="20" y2="6" stroke="white" strokeWidth="2" />
      <line y1="11" x2="20" y2="11" stroke="white" strokeWidth="2" />
    </svg>
  );
};

export default MenuIcon;
