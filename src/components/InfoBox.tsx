import { Info } from "lucide-react";

interface InfoBoxProps {
  title: string;
  items: string[];
}

const InfoBox = ({ title, items }: InfoBoxProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
