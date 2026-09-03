import { collection } from "firebase/firestore";   
import { getDocs } from "firebase/firestore";
import { Query } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { auth } from "./firebase";
import { db } from "./firebase";

export async function getUserReceipts() {
    try {
        const user = auth.currentUser;

        const summaryInfo = await getDocs(collection(
            db,
            'users',
            user.uid,
            'receipts'
        ));

        const receiptsSummary = summaryInfo.docs.map((document) => ({
            //add necessary data needed for your summary page (i.e like receipts that you need for the summary or total etc.)
        }))
    } 
    catch (error) {
        console.log("Error fetching receipts: ", error);   
    }
}