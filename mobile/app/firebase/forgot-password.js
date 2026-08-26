import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "app/firebase";

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(
            auth,
            email.trim().toLowerCase()
        );
    } 
    catch (error) {
        console.log("There has been an error trying to reset password: ", error);
    }
}