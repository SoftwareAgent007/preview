import React from 'react';
interface ListElementProps {
  logo: React.ReactNode; 
  title: string;
  description: string;
  titleColor?: string; 
  descriptionColor?: string; 
  backgroundColor?: string; 
}

const ListElement: React.FC<ListElementProps> = ({
  logo,
  title,
  description,
  titleColor = 'gray-700', 
  descriptionColor = 'gray-400', 
  backgroundColor = 'bg-blue-100/40' 
}) => {
  return (
    <div className={`flex ${backgroundColor} p-2 rounded-lg mb-3`}>
      <div className="flex-shrink-0 w-1/6 flex items-center justify-center">
        {logo} {/* Render the logo as a JSX element */}
      </div>
      <div className="flex-grow pl-2">
        <h2 className={`text-base font-semibold ${titleColor}`}>{title}</h2>
        <p className={`text-xs ${descriptionColor}`}>{description}</p>
      </div>
    </div>
  );
};

export default ListElement;
