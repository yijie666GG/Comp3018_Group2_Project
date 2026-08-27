import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export async function login(email, password) {
    try{
        const userLoginDetails = await signInWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password
        );

        console.log('Login successful');
    }
    catch (error){
        console.log('Login error: ', error);
    }
}