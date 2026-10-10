import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/apiAuth"
import { trialAccess } from "@/lib/commercial"
import NuevoEstudianteForm from "@/components/estudiantes/NuevoEstudianteForm"
export default async function NuevoEstudiantePage(){
 const auth=await getAuthContext();if(!auth)redirect("/login")
 const access=await trialAccess(auth.userId)
 if(access?.estado==="PRUEBA" && access.estudiantesUsados>=1)redirect("/suscripcion")
 return <NuevoEstudianteForm/>
}
