import { useEffect, useState } from "react";

export function useToggle(value?: boolean) {
  const [isOpen, setIsOpen] = useState(value ?? false);

  useEffect(() => {
    setIsOpen(value ?? false);
  }, [value]);

  function toggle() {
    setIsOpen((current) => !current);
  }

  return { isOpen, setIsOpen, toggle };
}
