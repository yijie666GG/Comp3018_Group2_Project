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
        //followed this structure if need help yijie https://www.youtube.com/watch?v=oxM78lxiFR0
        const user = auth.currentUser;

        const upload = await fetch(imageUri);

        const blob = await upload.blob();

        const userImage = ref(storage, `users/${user.uid}/receipts/${Date.now()}.jpg`);

        await uploadBytes(userImage, blob);

        const imageUrl = await getDownloadURL(userImage);

        const receipt = await addDoc(
            collection(
                db,
                'users',
                user.uid,
                'receipts'
            ),
            {
                store: receiptData.store,
                date: receiptData.date,
                time: receiptData.time,
                items: receiptData.items,
                total: Number(receiptData.total) || 0,
                gst: Number(receiptData.gst) || 0,
                imageUrl: imageUrl,
                createdAt: serverTimestamp(),
            }
        );

        return receipt.id;
        
    } 
    catch (error) {
        console.log("There was an error with saving receipt: ", error);
    }
}