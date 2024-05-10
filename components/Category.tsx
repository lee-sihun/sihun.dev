interface CategoryProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const category: { title: string }[] = [
  { title: "All" },
  { title: "Develop" },
  { title: "Design" },
];

export default function Category({
  selectedCategory,
  onCategorySelect,
}: CategoryProps) {
  return (
    <div className="category px-2.5 h-[62px] items-center flex mb-3 overflow-auto white-space: nowrap;">
      {category.map(({ title }) => {
        const isSelected = selectedCategory === title;
        const bgColor = isSelected
          ? "bg-black dark:bg-white"
          : "bg-white dark:bg-[#2C2C2E] hover:bg-black dark:hover:bg-white";
        const textColor = isSelected
          ? "text-white dark:text-[#2C2C2E]"
          : "text-black dark:text-white group-hover:text-white dark:group-hover:text-[#2C2C2E]";
        return (
          <div
            key={title}
            className={`group cursor-pointer rounded-xl w-fit h-[39px] mr-[9px] flex items-center shadow-[0_0px_10px_0px_rgba(0,0,0,0.1)] ${bgColor}`}
            onClick={() => onCategorySelect(title)}
          >
            <a className={`text-[18px] mx-6 ${textColor}`}>{title}</a>
          </div>
        );
      })}
    </div>
  );
}
