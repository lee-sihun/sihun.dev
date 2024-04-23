import Square from "../public/svg/square.svg";

export default function ThemeSwitcher() {
  return (
    <div className="relative w-8 h-8">
      <Square color={"#000000"}/>
      <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}