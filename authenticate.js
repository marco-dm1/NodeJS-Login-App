// Global clientside script for detecting existing session token

console.log("Session Authentication loaded!");

var cookies = document.cookie.split('; ')
var sessionToken;

for(let i = 0; i < cookies.length; i++){
    if(cookies[i].substring(0,13) == "sessionToken="){
        sessionToken = cookies[i].substring(13); // Remember the token we have found
        break; // No need to continue running loop since we have already found the token
    }
}

var logoutButton = document.getElementById("logoutButton");

if(logoutButton != null){
    if(sessionToken != null){
        // Show the logout button on all pages that have it and if the session token exists.
        logoutButton.style.display = "block";
    }
}

function logoutClick(){
    // Clears any existing sessionToken and reloads the page to clear any data on it
    document.cookie = "sessionToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    location.reload();
}

// The login/register pages and no sessionToken don't require requesting data from the server
if(document.URL.search("/login") == -1 && document.URL.search("/register") == -1 && sessionToken != null){
    console.log("Fetching account data with session token");
    let getData = fetch("./api/getdata", {
        headers: {
            token: sessionToken,
    }}).then(function(response){
        response.json().then(function(parseableData){
            if(parseableData["success"] == true){
                let headerName = document.getElementById("headerName");
                let joinDate = document.getElementById("joinDate");
    
                console.log("Inserting fetched data where necessary");
    
                if(headerName != null){
                    headerName.innerText = "Hello, " + parseableData["name"];
                }
                if(joinDate != null){
                    joinDate.innerText = parseableData["date"];
                }
            }
        }).catch(function(parseError){
            console.log("An error occured when parsing data: ", err)
        })
    }).catch(function(err){
        console.log("An error occured when fetching data: ", err)
    })
}