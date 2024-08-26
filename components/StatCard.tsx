import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

type StatCardProps ={
    type:"appointments" | "pending" |"cancelled",
    label:string,
    icon:string,
    count:number,
}

const StatCard = ({type, label, count =0, icon}:StatCardProps) => {
  return (
    <div className={clsx("p-6 flex flex-1 flex-col rounded-2xl shadow-lg bg-cover gap-4", {"bg-appointments" : type=== "appointments",
        "bg-pending": type ==="pending",
        "bg-cancelled": type === "cancelled"
    })}>
        <div className='flex items-center gap-4'>
            <Image src={icon} width={32} height={32} alt='icon' />
            <h2 className='text-32-bold text-white'>{count}</h2>
        </div>

        <p className=''>{label}</p>
    </div>
  )
}

export default StatCard