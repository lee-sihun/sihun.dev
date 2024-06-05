interface CategoryProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const category: { title: string }[] = [
  { title: "All" },
  { title: "Develop" },
  { title: "Design" },
  { title: "CS" },
  // { title: "PS" },
  { title: "Etc" },
];

export default function Category({
  selectedCategory,
  onCategorySelect,
}: CategoryProps) {
  return (
    <nav className="category h-[62px] items-center flex mb-3 overflow-auto white-space: nowrap;">
      {category.map(({ title }) => {
        const isSelected = selectedCategory === title;
        const bgColor = isSelected
          ? "bg-black dark:bg-white"
          : "bg-[#EDEDED] dark:bg-[#2C2C2E] hover:bg-[#D9D9D9] dark:hover:bg-[#414143]";
        const textColor = isSelected
          ? "text-white dark:text-[#2C2C2E]"
          : "text-black dark:text-white";
        return (
          <button
            key={title}
            className={`transition-colors duration-300 ease-in-out group cursor-pointer rounded-xl w-fit h-[39px] mr-[9px] flex items-center  ${bgColor}`}
            onClick={() => onCategorySelect(title)}
          >
            <div className={`text-[18px] mx-6 ${textColor}`}>{title}</div>
          </button>
        );
      })}
    </nav>
  );
}
