// Clientside script that handles the login button functionality

let accountName = document.getElementById("accountName");
let accountPassword = document.getElementById("accountPassword");
let statusMessageHeader = document.getElementById("statusMessageHeader")

function login(){
    if(accountName.value == "" || accountPassword.value == ""){return};
    // Create a get request to the server and send the name and password credentials in the header
    let apiFetch = fetch("./api/login", {
        headers: {
            name: accountName.value,
            password: accountPassword.value
        }
    }).then(function(response){
        response.json().then(function(jsonedResponse){
            if(jsonedResponse["success"] == true){
                if(jsonedResponse["token"] != null){
                    // Create a new local cookie for the session token received from the server and redirect to the profile
                    document.cookie=`sessionToken=${jsonedResponse["token"]}; path=/`;
                    window.location.href = "./profile";
                }
            }else{
                statusMessageHeader.innerText = jsonedResponse["status_msg"];
            }
        }).catch(function(promiseError){
            console.log("Promise error occured: ", promiseError);
        })
    }).catch(function(err){
        console.log("error: ", err)
    })
}