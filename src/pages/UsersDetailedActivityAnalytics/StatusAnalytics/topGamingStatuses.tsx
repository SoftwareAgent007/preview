import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Expand, Minimize } from "lucide-react";
import ReactDOM from "react-dom";

const TopGamingStatuses: React.FC<{ 
  topStatusMessages: { status: string; usedBy: number; trend: "increasing" | "decreasing" | "stable"; }[] 
}> = ({ topStatusMessages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="h-full flex flex-col">
      <Card className="p-6 pt-4 h-150">
        <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between items-center">
          <h3 className="text-lg font-bold">Top Status Messages</h3>
          <button onClick={openModal} className="p-2">
            <Expand />
          </button>
        </div>
        <ul className="space-y-4">
          {topStatusMessages.slice(0, 6).map((message, index) => (
            <li key={index} className="bg-gray-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl">{message.status}</span>
                <span className={`text-sm ${message.trend === 'increasing' ? 'text-green-500' : message.trend === 'decreasing' ? 'text-red-500' : 'text-gray-500'}`}>
                  {message.trend === 'increasing' ? `+${Math.floor(Math.random() * 10) + 1}%` : message.trend === 'decreasing' ? `-${Math.floor(Math.random() * 10) + 1}%` : 'Stable'}
                </span>
              </div>
              <span className="text-sm text-gray-600">Used by {message.usedBy} members</span>
            </li>
          ))}
        </ul>
      </Card>

      {isModalOpen && <Modal closeModal={closeModal} topStatusMessages={topStatusMessages} />}
    </div>
  );
};

const Modal: React.FC<{ closeModal: () => void; topStatusMessages: { status: string; usedBy: number; trend: "increasing" | "decreasing" | "stable"; }[] }> = ({ closeModal, topStatusMessages }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <Card className="bg-white p-6 w-1/2 h-[70vh] relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Top Status Messages</h2>
          <button className="absolute top-2 right-2" onClick={closeModal}>
            <Minimize />
          </button>
        </div>
        <ul className="space-y-4 h-[90%] overflow-y-auto flex flex-col">
          {topStatusMessages.map((message, index) => (
            <li key={index} className="bg-gray-200 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-medium">{message.status}</span>
                <span className={`text-sm ${message.trend === 'increasing' ? 'text-green-500' : message.trend === 'decreasing' ? 'text-red-500' : 'text-gray-500'}`}>
                  {message.trend === 'increasing' ? `+${Math.floor(Math.random() * 10) + 1}%` : message.trend === 'decreasing' ? `-${Math.floor(Math.random() * 10) + 1}%` : 'Stable'}
                </span>
              </div>
              <span className="text-sm text-gray-600">Used by {message.usedBy} members</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>,
    document.body
  );
};

export default TopGamingStatuses;
