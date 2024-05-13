import Image from "next/image";
import profileImg from "../../public/img/profile.jpeg";
import MailSvg from "../../public/svg/mail.svg";
import GithubSvg from "../../public/svg/github.svg";
import DiscordSvg from "../../public/svg/discord.svg";

const profile = {
  text: "🎉 제 블로그에 방문해주신 여러분 모두 환영합니다 🎉",
  img: profileImg,
  name: "이시훈",
  job: "프론트엔드 개발자",
  desc: "모든 사람이 자유로워지면 좋겠습니다",
};

export default function About() {
  return (
    <main className="flex justify-center flex-wrap mt-10 px-6">
      <article className="max-w-[768px] mx-auto text-center">
        <h2 className="font-bold text-2xl md:text-3xl">{profile.text}</h2>
        <div className="overflow-hidden w-[150px] h-[150px] rounded-[75px] md:w-[200px] md:h-[200px] md:rounded-[100px] mt-[30px] mx-auto">
          <Image
            src={profile.img}
            width={200}
            height={200}
            alt="profile"
            className="transition-transform duration-300 ease-in-out hover:scale-105"
            priority
          />
        </div>
        <h3 className="font-bold text-2xl mt-5">{profile.name}</h3>
        <h4 className="font-bold text-lg">{profile.job}</h4>
        <div className="flex justify-center items-center mt-[7px]">
          <div className="hover:bg-black/10 dark:hover:bg-white/30 rounded-md p-1 cursor-pointer">
            <MailSvg />
          </div>
          <div className="hover:bg-black/10 dark:hover:bg-white/30 rounded-md p-1 cursor-pointer mx-[10px]">
            <GithubSvg />
          </div>
          <div className="hover:bg-black/10 dark:hover:bg-white/30 rounded-md p-1 cursor-pointer">
            <DiscordSvg />
          </div>
        </div>
        <div className="h-px w-full my-5 bg-[#D4D4D4] dark:bg-[#686868]" />
        <p>{profile.desc}</p>
      </article>
    </main>
  );
}
