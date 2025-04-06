import React from "react";
import Icon from "../icons/Icon";

interface AlertNotificationProps {
  triggeredAlerts: string[];
  onClose: () => void;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({
  triggeredAlerts,
  onClose,
}) => {
  if (triggeredAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 shadow-lg rounded-lg">
        <div className="flex justify-between">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon name="alert" className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Alert{triggeredAlerts.length > 1 ? "s" : ""} Triggered
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {triggeredAlerts.map((alert, index) => (
                    <li key={index}>{alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-500"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertNotification;
