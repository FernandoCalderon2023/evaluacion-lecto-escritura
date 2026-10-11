import { requireAdmin } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { ControlCenter } from "@/components/admin/ControlCenter"
export const dynamic="force-dynamic"
export default async function AdminPage(){
 if(!(await requireAdmin()).ok)redirect("/dashboard")
 return <ControlCenter/>
}
