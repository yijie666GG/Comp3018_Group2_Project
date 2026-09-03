import { collection } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { auth } from "./firebase";
import { storage } from "./firebase";
import { ref } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";
import { uploadBytes } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";

export async function saveReceiptImage(receiptData, imageUri) {
    try {
        const user = auth.currentUser;

        const upload = await fetch(imageUri);

        const blob = await upload.blob();
        
    } 
    catch (error) {
        console.log("There was an error with saving receipt: ", error);
    }
}