import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
  return (
    <div className="flex justify-center">
      <div className="w-[1020px] h-[60px] flex justify-between items-center mx-4">
        <Nav />
        <ThemeSwitcher />
      </div>
    </div>
  );
}
