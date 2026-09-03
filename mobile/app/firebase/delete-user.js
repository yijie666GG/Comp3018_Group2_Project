import { deleteUser } from "firebase/auth";
import { auth } from "./firebase";

export async function deleteUser() {
    try {
        const user = auth.currentUser;

        await deleteUser(user);

        console.log("User deleted succesfully");
    } 
    catch (error) {
        console.log("Delete account error: ", error);
    }
}