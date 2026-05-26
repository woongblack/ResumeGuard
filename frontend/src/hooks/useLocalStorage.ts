import { useState } from "react";

export function useLocalStorage(key: string) {
  const [value, setValue] = useState<string>(
    () => localStorage.getItem(key) ?? ""
  );

  const set = (newValue: string) => {
    localStorage.setItem(key, newValue);
    setValue(newValue);
  };

  const clear = () => {
    localStorage.removeItem(key);
    setValue("");
  };

  return [value, set, clear] as const;
}
