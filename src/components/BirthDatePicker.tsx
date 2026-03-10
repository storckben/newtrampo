import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BirthDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

const months = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

const BirthDatePicker = ({ value, onChange, className }: BirthDatePickerProps) => {
  const currentYear = new Date().getFullYear();
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Generate years from 1920 to current year
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 
    (currentYear - i).toString()
  );

  // Generate days based on selected month and year
  const getDaysInMonth = (m: number, y: number) => {
    if (isNaN(m) || isNaN(y)) return 31;
    return new Date(y, m + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(
    month ? parseInt(month) : 0,
    year ? parseInt(year) : currentYear
  );

  const days = Array.from({ length: daysInMonth }, (_, i) => 
    (i + 1).toString().padStart(2, "0")
  );

  // Sync internal state with external value
  useEffect(() => {
    if (value) {
      setDay(value.getDate().toString().padStart(2, "0"));
      setMonth(value.getMonth().toString());
      setYear(value.getFullYear().toString());
    }
  }, [value]);

  // Update parent when all fields are selected
  useEffect(() => {
    if (day && month !== "" && year) {
      const newDate = new Date(parseInt(year), parseInt(month), parseInt(day));
      // Validate the date is valid
      if (
        newDate.getDate() === parseInt(day) &&
        newDate.getMonth() === parseInt(month) &&
        newDate.getFullYear() === parseInt(year)
      ) {
        onChange(newDate);
      }
    }
  }, [day, month, year, onChange]);

  // Adjust day if it exceeds days in selected month
  useEffect(() => {
    if (day && parseInt(day) > daysInMonth) {
      setDay(daysInMonth.toString().padStart(2, "0"));
    }
  }, [month, year, daysInMonth, day]);

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BirthDatePicker;
