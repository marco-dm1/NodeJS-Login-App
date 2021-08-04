// Clientside script that handles the register button functionality

const accountName = document.getElementById("accountName");
const accountPassword = document.getElementById("accountPassword");
const accountPasswordConfirm = document.getElementById("accountPasswordConfirm");
const statusMessageHeader = document.getElementById("statusMessageHeader");

function register(){
    // Confirm that the input fields have valid input
    if(accountName.value != "" && accountPassword.value != "" && accountPasswordConfirm.value != ""){
        if(accountPasswordConfirm.value == accountPassword.value){
            // Send a get request to the server with the name and password credentiasl
            let apiFetch = fetch("./api/register", {
                headers: {
                    name: accountName.value,
                    password: accountPassword.value
                }
            }).then(function(response){
                response.json().then(function(responseData){
                    if(responseData["success"] == true){
                        if(responseData["token"] != null){
                            // Set a local cookie for the Session Token so it can be used later and redirect to the profile page
                            document.cookie=`sessionToken=${responseData["token"]}; path=/`;
                            window.location.href = "./profile";
                        }
                    }else{
                        // Display error message if it wasn't successful
                        statusMessageHeader.innerText = responseData["status_msg"];
                    }
                }).catch(function(promiseErr){
                    console.log("promiseError: ", promiseErr);
                })
            }).catch(function(err){
                console.log("error: ", err)
            })
        }else{
            statusMessageHeader.innerText = "The two inputed passwords are not the same!"
        }
    }
}