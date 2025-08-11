
import {fetchUser} from "@/lib/fetchUser";
import ClockTimePage from "@/app/(dashboard)/clocktime/_components/ClockTimePage";
import {redirect} from "next/navigation";

export default async function ClockTime() {
    const session = await fetchUser()
    if(!session){
        redirect("/auth/login")
    }
    return (
        <ClockTimePage session={session}/>
    )
}
