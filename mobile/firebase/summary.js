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
        ),
        orderBy('date', 'desc'));

        const receiptsSummary = summaryInfo.docs.map((document) => {
            const data = document.data();

            return{
                id: document.id,
                date: data.date,
                total: Number(data.total) || 0,
                items: data.items || [],
            };
        });

        return receiptsSummary;

    } 
    catch (error) {
        console.log("Error fetching receipts: ", error);   
    }
}