"use server"

import { ID, Query } from "node-appwrite"
import { databases, messaging } from "../appwrite.config"
import { formatDateTime, parseStringify } from "../utils"
import { Appointment } from "./appwrite.types"
import { revalidatePath } from "next/cache"

export const CreateAppointment = async(appointment:CreateAppointmentParams)=>{
    try {
        const newAppointment =await databases.createDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
            ID.unique(),
            appointment
          )
          
          revalidatePath("/admin");
          return parseStringify(newAppointment)
    } catch (error) {
        console.log(error)
    }
}


export const getAppointment =async(appointmentId:string)=>{
    try {
        const appointment =await databases.getDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
            appointmentId
        )

        return parseStringify(appointment)
    } catch (error) {
        console.log(error)
    }
}

export const getRecentAppointmentList =async()=>{
    // we are fetching all appointments from descending order
    try {
        const appointments =await databases.listDocuments(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
            [Query.orderDesc('$createdAt')]
        ) 

        const initialCount ={
            scheduledCount:0,
            pendingCount:0,
            cancelledCount:0
        }

        // we want to itterate over the results gotten from fetching the latest documents, \
        // then check for their status
        const counts = (appointments.documents as Appointment[]).reduce((acc, appointment)=>{
            if(appointment.status === "scheduled"){
                acc.scheduledCount +=1;
            }else if(appointment.status === "pending"){
                acc.pendingCount +=1;
            }else if (appointment.status === "cancelled"){
                acc.cancelledCount +=1
            }

            return acc
        }, initialCount);

        const data ={
            totalCount:appointments.total,
            ...counts,
            documents:appointments.documents
        }

        return parseStringify(data)

    } catch (error) {
        console.log(error)
    }
}

export const updateAppointment =async({appointmentId,userId,appointment, type}:UpdateAppointmentParams)=>{
    try {
        const updatedAppointment =await databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!,
            appointmentId,
            appointment
        )


        if(!updatedAppointment){
            throw new Error('Appointment not found')
        }

        // TODO sms confirmation
        const smsMessage =`Hi, it's Careplus. 
        ${type === "schedule" ? `Your appointment has been scheduled for ${formatDateTime(appointment.schedule).dateTime} with Dr. ${appointment.primaryPhysician}` :
             `We regret to inform you that your appointment has been cancelled. Reason- ${appointment.cancellationReason}`}
        `

        await sendSmsNotification(userId, smsMessage)

        revalidatePath("/admin")
        return parseStringify(updatedAppointment)
    } catch (error) {
        console.log(error)
    }
}

const sendSmsNotification =async(userId:string, content:string)=>{
    try {
        const message = await messaging.createSms(
            ID.unique(),
            content,
            [],
            [userId]
        )

        return parseStringify(message)
    } catch (error) {
        console.log(error)
    }
}