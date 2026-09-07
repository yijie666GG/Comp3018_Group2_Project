import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import { auth } from './firebase';

GoogleSignin.configure({
    webClientId:
        '974034879516-jkcs8cqpr45m2grq7pr90mpa5hfrtv47.apps.googleusercontent.com',
});

export async function googleLogin() {
    await GoogleSignin.hasPlayServices();

    const userInfo = await GoogleSignin.signIn();

    const idToken = userInfo.data?.idToken || userInfo.idToken;

    if (!idToken) {
        throw new Error('Google ID token was not returned.');
    }

    const credential = GoogleAuthProvider.credential(idToken);

    const result = await signInWithCredential(auth, credential);

    console.log('Google login successful:', result.user.email);

    return result.user;
}