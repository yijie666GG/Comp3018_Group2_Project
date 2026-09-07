import { collection, addDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function uniqueCategories(params) {
    try{
        const user = auth.currentUser;

        const userCategories = await getDocs(collection(
            db,
            "users",
            user.uid,
            "categories"
        ));

        const categories = userCategories.docs.map((document) => ({
            name: document.data().name,
        }));
    }
    catch(error){
        console.log("There has been an error trying to retrieve categories: ", error);
    }
}


export async function addCategory(params) {
    try{
        const user = auth.currentUser;
        
        const userCategories = await addDoc(collection(
            db,
            "users",
            user.uid,
            "categories"
        ),{
            name: name.trim(),
        });
    }
    catch(error){
        console.log("There was an error trying to add this category: ", error);
    }
}


export async function deleteCategory(params) {
    try {
        const user = auth.currentUser;

        await deleteDoc(doc(
            db,
            "users",
            user.uid,
            "categories",
            categoryId
        ))
    } 
    catch (error) {
        console.log("There was an error with deleting category: ", error);
    }
}