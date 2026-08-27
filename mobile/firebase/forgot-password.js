import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(
            auth,
            email.trim().toLowerCase()
        );

        console.log("Password reset email sent");
    } catch (error) {
        console.log(
            "There has been an error trying to reset password: ",
            error
        );

        throw error;
    }
}