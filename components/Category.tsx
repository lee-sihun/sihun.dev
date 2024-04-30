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
    <div className="category px-2.5 h-[62px] items-center flex mb-5 overflow-auto white-space: nowrap;">
      {category.map(({ title }) => {
        const isSelected = selectedCategory === title;
        const bgColor = isSelected
          ? "bg-black dark:bg-white"
          : "bg-white dark:bg-[#2C2C2E]";
        const textColor = isSelected
          ? "text-white dark:text-[#2C2C2E]"
          : "text-black dark:text-white";
        return (
          <div
            key={title}
            className={`cursor-pointer rounded-xl w-fit h-[42px] mr-[9px] flex items-center shadow-[0_0px_10px_0px_rgba(0,0,0,0.1)] ${bgColor}`}
            onClick={() => onCategorySelect(title)}
          >
            <a className={`text-[19px] mx-6 ${textColor}`}>{title}</a>
          </div>
        );
      })}
    </div>
  );
}
