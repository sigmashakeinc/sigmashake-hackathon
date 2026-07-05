type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | Record<string, boolean | null | undefined>
  | ClassValue[];

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];

  function append(input: ClassValue): void {
    if (!input) return;
    if (Array.isArray(input)) {
      input.forEach(append);
      return;
    }
    if (typeof input === "object") {
      for (const [key, enabled] of Object.entries(input)) {
        if (enabled) classes.push(key);
      }
      return;
    }
    classes.push(String(input));
  }

  inputs.forEach(append);
  return classes.join(" ");
}
