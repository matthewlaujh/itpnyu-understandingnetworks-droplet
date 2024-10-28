// public/script.js

const authContainer = document.createElement("div");
authContainer.id = "firebaseui-auth-container";

let authUser;
let loggedIn = false;
let localUserEmail;
let myDBID;

// Function to fetch Firebase config from the server
async function fetchFirebaseConfig() {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config');
    }
    const config = await response.json();
    console.log('Fetched Firebase config:', config);
    return config;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
}

// Initialize Firebase with the fetched config
fetchFirebaseConfig()
  .then(config => {
    // Initialize Firebase
    firebase.initializeApp(config);
    
    // Setup FirebaseUI config
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          authUser = authResult;
          console.log("successfully logged in", authResult.user.email);
          if (loggedIn) location.reload();
          return false;
        },
        uiShown: function() {
          const loader = document.getElementById('loader');
          if (loader) {
            loader.style.display = "none";
          }
        }
      },
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      tosUrl: '<your-tos-url>',
      privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    // Initialize the FirebaseUI Auth
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    
    // Set persistence
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

    // Handle auth state changes
    firebase.auth().onAuthStateChanged((firebaseAuthUser) => {
      const themeInputField = document.getElementById("themeInputField");
      const inputField = document.getElementById("inputField");
      const askButton = document.getElementById("askButton");
      const signOutButton = document.getElementById("signOut");
      const nameElement = document.getElementById("name");
      const profileImage = document.getElementById("profile-image");

      if (!firebaseAuthUser) {
        if (nameElement) {
          nameElement.style.display = "none";
        }
        if (profileImage) {
          profileImage.style.display = "none";
        }
        if (signOutButton) {
          signOutButton.style.display = "none";
        }
        console.log("no valid login, sign in again?");
        ui.start("#firebaseui-auth-container", uiConfig);

        if (themeInputField) {
          themeInputField.disabled = true;
          themeInputField.style.backgroundColor = "gray";
        }
        if (inputField) {
          inputField.disabled = true;
          inputField.style.backgroundColor = "gray";
        }
        if (askButton) {
          askButton.disabled = true;
        }
      } else {
        console.log("we have a user", firebaseAuthUser);
        authUser = firebaseAuthUser;
        loggedIn = true;

        if (signOutButton) {
          signOutButton.style.display = "block";
        }
        localUserEmail = firebaseAuthUser.email;
        myDBID = firebaseAuthUser.uid;
        console.log("User", firebaseAuthUser, "myDBID", myDBID);
        
        if (nameElement) {
          nameElement.innerHTML = firebaseAuthUser.displayName || '';
          nameElement.style.display = "block";
        }
        
        if (profileImage && firebaseAuthUser.photoURL) {
          profileImage.src = firebaseAuthUser.photoURL;
          profileImage.style.display = "block";
        }

        if (themeInputField) {
          themeInputField.disabled = false;
          themeInputField.style.backgroundColor = "white";
        }
        if (inputField) {
          inputField.disabled = false;
          inputField.style.backgroundColor = "white";
        }
        if (askButton) {
          askButton.disabled = false;
        }
      }
    });

    // Setup sign out button
    const signOutButton = document.getElementById("signOut");
    if (signOutButton) {
      signOutButton.addEventListener("click", function() {
        firebase.auth().signOut()
          .then(function() {
            console.log("User signed out");
            location.reload();
          })
          .catch(function(error) {
            console.log("Error:", error);
          });
      });
    }
  })
  .catch(error => {
    console.error('Error initializing Firebase:', error);
  });
