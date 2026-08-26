import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "app/firebase";

//create user logic 
export async function register(name, email, password) {
    try{
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password
        );
        
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: name.trim(),
            email: email.trim().toLowerCase(),
        });
        console.log('Account created successfully');
    }
    catch(error){
        console.log("There has been an error with user registration: ", error);
    }
}