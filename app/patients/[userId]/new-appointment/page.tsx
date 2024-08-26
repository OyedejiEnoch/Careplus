import AppointmentForm from '@/components/forms/AppointmentForm'
import { getPatient } from '@/lib/actions/patient.actions'
import Image from 'next/image'
import React from 'react'
import * as Sentry from "@sentry/nextjs"

const NewAppointment =async ({params: {userId}}:SearchParamProps) => {

    const patient =await getPatient(userId)
    Sentry.metrics.set("user_view_new-appointment", patient.name);

  return (
    <div  className="flex h-screen max-h-screen">
        <section className='container my-auto'>
            <div className='sub-container max-w-[860px] flex-1 justify-between'>
                <Image src="/assets/icons/logo-full.svg" alt="logo" height={1000} width={1000} className="mb-12 h-10 w-fit" />
            
            <AppointmentForm type="create" userId={userId} patientId={patient.$id} />
            
                <p className="copyright mt-10 py-10 ">&copy; 2024 CarePlus Enoch Oyedeji</p>
            </div>

        </section>
        

        <Image src={"/assets/images/appointment-img.png"} alt="img" height={1000} width={1000} className="side-img max-w-[390px] bg-bottom"  />
    </div>
  )
}

export default NewAppointment