"use client"
import { Link } from "next-view-transitions";
import FolderButton from "../FolderButton/FolderButton";
import { FooterRive } from "./FooterRive";
import { useEffect, useState } from "react";

export default function Footer() {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeString = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Europe/Budapest",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }).format(now);
            setTime(timeString);
        };

        updateTime();
        // Update every second to ensure we switch the minute exactly when it happens
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="p-[50px] flex items-center lg:justify-between lg:items-end flex-col lg:flex-row gap-[40px] lg:gap-[0px]">

            <div className="flex lg:items-end flex-col lg:flex-row w-fit gap-[70px] lg:gap-[0px]">
                <div className="flex flex-col gap-[26px] items-center justify-center">
                    <Link href="/works">
                        <FolderButton />
                    </Link>
                    <p className="font-intranet text-md text-midgray leading-[100%]">WORKS</p>
                </div>
                <FooterRive className="w-[350px] translate-y-[-10px]" />
            </div>

            <div className="flex flex-col gap-[2px] text-center w-fit lg:text-left">
                <p className="text-sm leading-[100%] translate-y-[2.5px] font-intranet text-midgray min-h-[14px]">{time} [HU]</p>
                <div className="flex gap-[5px] items-center">
                    <div className="w-[10px] h-[10px] p-[4px] rounded-full bg-gradient-to-b from-[#0FFF2F] to-[#84FF6F] shadow-[0_0_10px_0.2px_#0FFF2F]">
                        <div className="w-full h-full rounded-full bg-gradient-to-b from-[#6CFF6C] to-[#23FF1F]" />
                    </div>
                    <p className="text-sm leading-[100%] translate-y-[2.5px] font-intranet text-midgray">WAITING FOR YOUR MESSAGE</p>
                </div>
            </div>
        </section>
    )
}