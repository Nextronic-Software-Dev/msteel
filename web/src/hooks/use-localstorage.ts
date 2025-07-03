import { useState, useEffect, useDebugValue } from "react";

function useLocalStorage(key: any, initialValue: any) {
  // Retrieve the value from local storage or use the initial value
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined") {
      const storedValue = window.localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : initialValue;
    }
    return initialValue;
  });

  // Display the current value in React DevTools
  useDebugValue(value);

  // Update local storage whenever the value changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [value, key]);

  // Return the value and a function to update it
  return [value, setValue];
}

export default useLocalStorage;
