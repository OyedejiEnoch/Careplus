"use client"
import React, { useEffect, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

  import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
  
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { decryptKey, encryptKey } from '@/lib/utils'
  

const PassKeyModal = () => {
    const router =useRouter()
    const path =usePathname()
    const [open, setOpen]=useState(true)
    const [passKey, setPassKey]=useState("")
    const [error, setError]=useState("")

    const closeModel=()=>{
        setOpen(false)
        router.push("/")
    }

    // we want to firstly check if there is an admin passKey login already,
    // since where we are setting the passKey is in our local storage,we are getting it from there
    const encryptedKey =typeof window !== "undefined" ? window.localStorage.getItem("accessKey") : null



    useEffect(()=>{
        // if there is an encrypted key i.e there is a passkey in the localstorage, we decrypt the key 
        const accessKey =encryptedKey && decryptKey(encryptedKey)

        if(path){
            // compare if the decrypted key is equal to the Next Public Passkey and then push to the admin page
            if(accessKey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY){   
                setOpen(false)
                router.push("/admin")
            }else{
                setOpen(true)
            }
        }
    },[encryptedKey])

    const validatePassKey=(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        e.preventDefault()

        // if passkey is equal to the Public PassKey, we would encrypt the key and then set it into the local storage
        if(passKey === process.env.NEXT_PUBLIC_ADMIN_PASSKEY){
            const encryptedKey =encryptKey(passKey);

            localStorage.setItem("accessKey", encryptedKey) 
            setOpen(false)
        }else{
            setError("Invalid passkey, Please try again")
        }
    }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
    {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
    <AlertDialogContent className='shad-alert-dialog'>
      <AlertDialogHeader>
        <AlertDialogTitle className='flex items-start justify-between'>Admin access verification
            <Image src={"/assets/icons/close.svg"} alt='close' width={20} height={20} onClick={()=>closeModel()} className='cursor-pointer' />
        </AlertDialogTitle>
        <AlertDialogDescription>
          To access the admin page, please enter the passkey
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div>
      <InputOTP maxLength={6} value={passKey} onChange={(value)=>setPassKey(value)} >
        <InputOTPGroup className='shat-otp'>
            <InputOTPSlot index={0} className='shad-otp-slot' />
            <InputOTPSlot index={1} className='shad-otp-slot' />
            <InputOTPSlot index={2} className='shad-otp-slot'/>
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
            <InputOTPSlot index={3} className='shad-otp-slot' />
            <InputOTPSlot index={4} className='shad-otp-slot' />
            <InputOTPSlot index={5} className='shad-otp-slot'/>
        </InputOTPGroup>
        </InputOTP>

        {error && <p className='shad-error text-14-regular mt-4 flex justify-center'>{error}</p>}

            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={(e)=> validatePassKey(e)}
                    className='shad-primary-btn w-full'>Enter Adminpasskey</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
  
  )
}

export default PassKeyModal