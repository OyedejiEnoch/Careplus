"use server"

import { ID, Query } from "node-appwrite"
import { BUCKET_ID, databases, storage, users } from "../appwrite.config"
import { parseStringify } from "../utils"
import {InputFile} from "node-appwrite/file"

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
    try {
      // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
      const newuser = await users.create(
        ID.unique(),
        user.email,
        user.phone || undefined,
        undefined,
        user.name
      );
  
      return parseStringify(newuser);


    } catch (error: any) {
        console.log(error)
      // Check existing user
      if (error && error?.code === 409) {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);
  
        return existingUser.users[0];
      }
      console.error("An error occurred while creating a new user:", error);
    }
  };


export const getUser = async (userId: string)=>{
  try {

    const user = await users.get(userId)

    return parseStringify(user)
    
  } catch (error) {
    console.log(error)
  }
}

export const registerPatient =async({identificationDocument, ...patient}:RegisterUserParams)=>{
  try {
      let file

      // we firstly add the document to the storage
      if(identificationDocument) {
        const inputFile =InputFile.fromBuffer(
          identificationDocument?.get('blobfile') as Blob,
          identificationDocument?.get('fileName') as string
        )

        file = await storage.createFile(process.env.NEXT_PUBLIC_BUCKET_ID!,ID.unique(), inputFile)
      }

      // after adding the storage, we then create the patient. its just like adding the image first to cloudinary, then getting the url
      // link and passing to the req.body to create the user
      
      const newPatient =await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
        ID.unique(),
        {
          identificationDocumentId: file?.$id || null,
          identificationDocumentUrl: `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${file?.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}`,
          ...patient
        }
      )

      return parseStringify(newPatient)

  } catch (error) {
    console.log(error)
  }
}

export const getPatient = async (userId: string)=>{
  try {

    const patients = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    )

    return parseStringify(patients.documents[0])
    
  } catch (error) {
    console.log(error)
  }
}