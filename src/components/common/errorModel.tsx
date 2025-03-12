import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  className?: string;
  height?: number | string;
  onClick?: (event: React.MouseEvent) => void;
}

const AlertIcon = () => (
  <div className="flex justify-center items-center w-16 h-16">
    <AlertTriangle className="text-red-500 w-12 h-12" />
  </div>
);

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title = 'Data retrieval issue',
  message = 'Unable to fetch data.',
  className = '',
  height = '100%',
  onClick
}) => {
  return (
    <Card 
      className={`flex flex-col items-center justify-center w-full border border-red-500 p-4 bg-red-50 ${className}`}
      onClick={onClick}
      style={{ height }}
    >
      <AlertIcon />
      <p className="text-red-600 font-bold mt-2">{title}</p>
      <p className="text-red-500 text-sm">{message}</p>
    </Card>
  );
};

export default ErrorComponent;
