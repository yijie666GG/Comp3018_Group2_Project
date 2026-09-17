import {
    deleteUser as firebaseDeleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    reauthenticateWithCredential,
} from 'firebase/auth';

import {
    collection,
    deleteDoc,
    doc,
    getDocs,
} from 'firebase/firestore';

import {
    GoogleSignin,
} from '@react-native-google-signin/google-signin';

import { auth, db } from './firebase';

export async function deleteUserAccount(password = '') {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('No authenticated user.');
    }

    const providerIds = user.providerData.map(
        (provider) => provider.providerId
    );

    // Re-authenticate email/password users
    if (providerIds.includes('password')) {
        if (!user.email) {
            throw new Error(
                'Unable to verify the account email.'
            );
        }

        if (!password.trim()) {
            throw new Error(
                'Please enter your password before deleting your account.'
            );
        }

        const credential =
            EmailAuthProvider.credential(
                user.email,
                password
            );

        await reauthenticateWithCredential(
            user,
            credential
        );
    }

    // Re-authenticate Google users
    if (providerIds.includes('google.com')) {
        await GoogleSignin.hasPlayServices();

        const result =
            await GoogleSignin.signIn();

        const idToken =
            result?.data?.idToken ||
            result?.idToken;

        if (!idToken) {
            throw new Error(
                'Unable to verify your Google account.'
            );
        }

        const credential =
            GoogleAuthProvider.credential(
                idToken
            );

        await reauthenticateWithCredential(
            user,
            credential
        );
    }

    const uid = user.uid;

    // Delete receipts subcollection
    const receiptsRef = collection(
        db,
        'users',
        uid,
        'receipts'
    );

    const receiptsSnapshot =
        await getDocs(receiptsRef);

    for (const receiptDocument of receiptsSnapshot.docs) {
        await deleteDoc(
            doc(
                db,
                'users',
                uid,
                'receipts',
                receiptDocument.id
            )
        );
    }

    // Delete Firestore user document
    await deleteDoc(
        doc(
            db,
            'users',
            uid
        )
    );

    // Delete Firebase Authentication account
    await firebaseDeleteUser(user);

    // Clear Google session if needed
    if (providerIds.includes('google.com')) {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.log(
                'Google sign-out after deletion:',
                error
            );
        }
    }

    console.log(
        'User account and stored data deleted successfully.'
    );
}