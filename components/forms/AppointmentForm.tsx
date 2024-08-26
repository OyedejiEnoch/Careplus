"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { getAppointmentSchema } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"
import { FormFieldType } from "./PatientForm"
import { Doctors } from "@/constants"
import { SelectItem } from "../ui/select"
import Image from "next/image"
import { CreateAppointment, updateAppointment } from "@/lib/actions/appointment.actions"
import { Appointment } from "@/lib/actions/appwrite.types"




const AppointmentForm=({userId, patientId, type, appointment, setOpen}:{userId:string, patientId:string, type:"create" | "cancel" |"schedule",
  appointment?:Appointment, setOpen?:(open: boolean)=>void
})=>{
    const router =useRouter()
    const [isLoading, setIsLoading]=useState(false)

  // 1. Define your form.

  const AppointmentFormValidation =getAppointmentSchema(type)

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment.primaryPhysician : "",
      schedule:appointment ? new Date(appointment.schedule) : new Date(Date.now()),
      reason: appointment ? appointment.reason : "" ,
      note:appointment ? appointment.note : "",
      cancellationReason: appointment?.cancellationReason || ""
    },
  })

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
    console.log("submit", {type})
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status="scheduled";
        break;
      case "cancel":
        status="cancelled";
        break;
      default:
        status="pending"
        break;
    }

    try {
      
      if(type === "create" && patientId ){
        const appointmentData={
          userId,
          patient:patientId,
          primaryPhysician:values.primaryPhysician,
          schedule:new Date(values.schedule),
          reason:values.reason!,
          note:values.note,
          status: status as Status
        }
        const appointment =await CreateAppointment(appointmentData)

        if(appointment){
          form.reset
          router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
        }
      }else {
        const appointmentToUpdate ={
          userId,
          appointmentId:appointment?.$id!,
          appointment:{
            primaryPhysician: values?.primaryPhysician,
            schedule:new Date(values?.schedule),
            status: status as Status,
            cancellationReason: values?.cancellationReason,

          },
          type
        }

        const updatedAppointment =await updateAppointment(appointmentToUpdate)
        console.log("done cancelled")
        
          setOpen && setOpen(false)
          form.reset()
        
      }
     

    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };


  let buttonLabel;

  switch (type) {
    case "cancel":
         buttonLabel=`Cancel Appointment`
        break;
    
    case "create":
         buttonLabel="Create Appointment"
        break;
    case "schedule":
    buttonLabel ="Schedule Appointment"
    default:
        break;
  }


  return(
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === "create" && 
        <section className="mb-12 space-y-4">
            <h1 className="header text-white">New Appointment
            !!...</h1>
            <p className="text-dark-700">Request an appointment.</p>
        </section>}
        
            {type !== "cancel" &&
                <>
                 <CustomFormField 
                    control={form.control} 
                    fieldType={FormFieldType.SELECT} 
                    name={"primaryPhysician"}
                    label="Doctor"
                    placeholder="Select a doctor"
                   
                    >
              {Doctors.map((doctor)=>(
                <SelectItem key={doctor.name} value={doctor.name}>
                    <div className="flex items-center cursor-pointer gap-2">
                        <Image src={doctor.image} width={32} alt={doctor.name} height={32} className="rounded-full border border-dark-500" />
                    <p>{doctor.name}</p>
                    </div>
                </SelectItem>
            ))}
                    
                </CustomFormField>
                

                <CustomFormField 
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control} 
                    name="schedule"
                    label="Expected appointment date"
                    showTimeSelect
                    dateFormat="MM/dd/yyyy - h:mm aa "

                
                />

                <div className="flex flex-col xl:flex-row gap-4">
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control} 
                        name="reason"
                        label="Reason for appointment"
                        placeholder="Enter reason for appointment"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control} 
                        name="note"
                        label="Notes"
                        placeholder="Enter notes"
                    />
                </div>


                </>
            
            }

            {type === "cancel" && 
            (
                <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control} 
                    name="cancellationReason"
                    label="Reason for cancellation"
                    placeholder="Enter a reason for cancelation"
                
                />
            )
            }
           
            
   <SubmitButton isLoading={isLoading} className={`${type === 'cancel' ? "shad-danger-btn" : "shad-primary-btn"}`}>{buttonLabel}</SubmitButton>
      {/* <Button type="submit">Submit</Button> */}
    </form>
  </Form>
  )
}


export default AppointmentForm