import { Link } from "next-view-transitions";

export default function NavLogo() {
    return (
        <Link href={"/"}>
            <img alt="logo" src="/icons/logo.svg" className="fixed top-[40px] left-[10px] sm:left-[20px] lg:left-[50px] lg:top-[50px] w-[35px] z-[500] mix-blend-screen" style={{viewTransitionName: "nav"}}/>
        </Link>
    )
}