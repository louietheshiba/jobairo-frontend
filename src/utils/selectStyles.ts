// utils/selectStyles.ts
export const getSelectStyles = (isDarkMode: boolean) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    borderColor: state.isFocused ? "#10b981" : isDarkMode ? "#374151" : "#d1d5db",
    borderRadius: "0.5rem",
    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#10b981" : isDarkMode ? "#282828" : "#9ca3af",
    },
    minHeight: "2.5rem",
    fontSize: "0.875rem",
  }),
  input: (provided: any) => ({
    ...provided,
    color: isDarkMode ? "#fff" : "#000",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: isDarkMode ? "#282828" : "#6b7280",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: isDarkMode ? "#fff" : "#000",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: isDarkMode ? "#282828" : "#fff",
    border: `1px solid ${isDarkMode ? "#282828" : "#10b981"}`,
    borderRadius: "0.5rem",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#10b981"
      : state.isFocused
      ? isDarkMode
        ? "#282828"
        : "#f3f4f6"
      : isDarkMode
      ? "#282828"
      : "#fff",
    color: state.isSelected
      ? "#fff"
      : isDarkMode
      ? "#282828"
      : "#111827",
  }),
});
