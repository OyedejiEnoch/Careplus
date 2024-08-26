"use client"
import React from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
import { Control } from 'react-hook-form'
import { FormFieldType } from './forms/PatientForm'
import Image from 'next/image'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'

interface CustomProps {
    control:Control<any>
    fieldType:FormFieldType
    name:string
    label?:string
    placeholder?:string
    iconSrc?:string
    iconAlt?:string
    disabled?:boolean,
    dateFormat?:string,
    showTimeSelect?:boolean,
    children?:React.ReactNode,
    renderSkeleton?:(field:any)=>React.ReactNode
}

const RenderField =({field, props}:{field:any, props:CustomProps})=>{
    const {control, fieldType, name, label, placeholder, iconSrc, iconAlt, showTimeSelect, dateFormat, renderSkeleton} =props
  
    switch (fieldType) {
        case FormFieldType.INPUT:
            return (
                <div className='flex rounded-md border border-dark-500 bg-dark-400'>
                    {iconSrc && (
                        <Image src={iconSrc} height={24} width={24} alt='icon' className='ml-2' />
                    )}

                    <FormControl>
                        <Input placeholder={placeholder} {...field} className='shad-input border-0 text-white' />
                    </FormControl>

                </div>
            )
        case FormFieldType.PHONE_INPUT:
            return(
                <FormControl>
                    <PhoneInput 
                    className='text-white input-phone'
                        defaultCountry='US'
                        placeholder={placeholder}
                        international
                        withCountryCallingCode
                        value={field.value}
                        onChange={field.onChange}
                    />
                </FormControl>
            )
        
            case FormFieldType.DATE_PICKER:
                return(
                    <div className='flex rounded-md border border-dark-500 bg-dark-400 text-white'>
                        <Image src={"/assets/icons/calendar.svg"} height={24} width={24} alt='icon' className='ml-2' />
                        <FormControl>
                            <DatePicker selected={field.value} onChange={(date)=>field.onChange(date)}
                            dateFormat={dateFormat ?? "MM/dd/yyyy"}
                            showTimeSelect={showTimeSelect ?? false}
                            timeInputLabel='Time'
                            wrapperClassName='date-picker'
                            />
                        </FormControl>
                    </div>
                )
            
            case FormFieldType.SKELETON:
                return props.renderSkeleton ? props.renderSkeleton(field) : null;

            case FormFieldType.SELECT:
                return(
                    <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className='shad-select-trigger text-white' >
                                    <SelectValue placeholder={placeholder} />                     
                                </SelectTrigger>

                            </FormControl>
                            <SelectContent className='shad-select-content text-white'>
                                {props.children}
                            </SelectContent>
                        </Select>
                    </FormControl>
                )
            
            case FormFieldType.TEXTAREA:
                return(
                    <FormControl>
                        <Textarea placeholder={placeholder} {...field} 
                        className='shad-textArea text-white border-0 ' disabled={props.disabled} />
                    </FormControl>
                )
            case FormFieldType.CHECKBOX:
                return(
                    <FormControl>
                       <div className='flex items-center gap-4 '>
                            <Checkbox id={props.name} checked={field.value} onCheckedChange={field.onChange}  />
                            <label htmlFor={props.name} className='checkbox-label'>{props.label} </label>
                       </div>
                    </FormControl>
                )
        default:
            return null;
    }
}


const CustomFormField = (props:CustomProps) => {
    const {control, fieldType, name, label, placeholder, iconSrc, iconAlt} =props
  return (
    <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className='flex-1'>
        {/* i.e is the formfield type is not of type checkbox and if a label exist show the labe; */}
        {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className='text-white'>{label}</FormLabel>
        )}

        <RenderField field={field} props={props} />
        
        <FormMessage className='shad-error' />

      </FormItem>
    )}
  />
  )
}

export default CustomFormField