// Serverside functionality for the HTTP server

const http = require("http");
const fs = require("fs");
const db = require("./databaseFunctions.js");
const bcrypt = require("bcrypt");

function generateSessionToken(nameInput){
    // Generate a random string for the session token
    let characters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890"
    let returnToken = ""
    for(let i = 0; i < 50; i++){
        returnToken = returnToken + characters[Math.floor(Math.random() * characters.length)]
    }
    // Append the name to the token so the token is guaranteed to be 100% unique
    return nameInput + "-" + returnToken;
}

const server = http.createServer(function(request, response){
    if(request.url == "/api/login" && request.headers["name"] != null && request.headers["password"] != null){
        response.setHeader("Content-Type", "application/json");

        let QueryDatabase = new Promise(async function(resolve, reject){
            // Get current account data from database of using the name as search query
            let loginData = await db.loginAccountSearch(String(request.headers["name"]));
            if(loginData != null || loginData == false){
                resolve(loginData);
            }else{
                reject();
            }
        })
        QueryDatabase.then(function(resolution){
            let checkPasswordPromise = new Promise(async function(checkPasswordResolve, checkPasswordReject){
                // Determine if the inputted password is the same as the hashed password from the database
                let bcryptCheckPassword = bcrypt.compare(String(request.headers["password"]), resolution["password"], function(bcryptError, bcryptResult){
                    if(bcryptError){console.log("bcryptError"); checkPasswordReject()}
                    if(bcryptResult == true){
                        checkPasswordResolve();
                    }else{
                        checkPasswordReject();
                    }
                });
            }).then(function(){
                // Generate a new session token for the client and then send it to them through JSON
                let newSessionToken = generateSessionToken(String(request.headers["name"]));
                console.log("A new session token was created and sent to the client.")
                db.updateToken(String(request.headers["name"]), newSessionToken);
                response.write(JSON.stringify({success: true, token: newSessionToken, status_msg: "Successfully logged in."}));
                response.end();
            }).catch(function(){
                response.write(JSON.stringify({success: false, status_msg: "The inputted password was wrong."}));
                response.end();
            })
        }).catch(function(resolutionError){
            response.write(JSON.stringify({success: false, status_msg: "Unable to find an account with the inputted name."}));
            response.end();
        })
    }else if(request.url == "/api/getdata" && request.headers["token"]){
        response.setHeader("Content-Type", "application/json");
        // Use the session token as a search query to find data from the database to populate a client's webpage
        let getDataPromse = new Promise(async function(dataResolve, DataReject){
            let getData = await db.getAccountData(String(request.headers["token"]))
            if(getData != null){
                dataResolve(getData);
            }else{
                DataReject();
            }
        })
        getDataPromse.then(function(dataResolution){
            if(dataResolution != false){
                // Return the name and registration_time fields to the client so it populates their webpage
                response.write(JSON.stringify({success: true, name: dataResolution["name"], date: dataResolution["registration_time"]}));
                response.end();
            }else{
                console.log("The requested data was not found.");
                response.write(JSON.stringify({success: false}));
                response.end();
            }
            
        }).catch(function(dataError){
            console.log("An error occured when trying to get data with a token: ", dataError);
            response.write(JSON.stringify({success: false}));
            response.end();
        })
    }else if(request.url == "/api/register" && request.headers["name"] != null && request.headers["name"] != "" && request.headers["password"] != null && request.headers["password"] != ""){
        response.setHeader("Content-Type", "application/json");
        // Search the database using the inputted name to determien if an account with that name already exists
        let checkIfExists = new Promise(async function(checkResolve, checkReject){
            let accountSearch = await db.searchForAccount(String(request.headers["name"]));
            if(accountSearch == null){
                checkResolve();
            }else{
                checkReject()
            }
        })
        checkIfExists.then(function(){
            let createAccountPromise = new Promise(function(createResolve, createReject){
                // Use bcrypt to hash the inputted password 5 times
                let hashingPassword = bcrypt.hash(String(request.headers["password"]), 5, function(err, hash) {
                    if(err){
                        console.log("error: ", err);
                        createReject();
                    }else{
                        createResolve(hash)
                    };
                });
            })
            createAccountPromise.then(function(hash){
                // Generate a new session token and store the rest of the data in the database to be queried later. The session token is returned to the client
                let newSessionToken = generateSessionToken(String(request.headers["name"]));
                console.log("A new session token was created and sent to the client.")
                db.registerAccount(String(request.headers["name"]), hash, newSessionToken);
                response.write(JSON.stringify({success: true, token: newSessionToken, status_msg: "Account was created."}));
                response.end();
            }).catch(function(createError){
                console.log("hashing error");
                response.write(JSON.stringify({success: false, status_msg: "A password hashing error occured."}));
                response.end();
            })
        }).catch(function(err){
            console.log("account already exists");
            response.write(JSON.stringify({success: false, status_msg: "That account name already exists!"}));
            response.end();
        })
    }else if(request.url == "/" || request.url == "/index"){
        // Return clientside index page
        fs.readFile("index.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/profile"){
        // Return clientside profile page
        fs.readFile("profile.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/login"){
        // Return clientside login page
        fs.readFile("login.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/register"){
        // Return clientside register page
        fs.readFile("register.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/authenticate.js" || request.url == "/login.js" || request.url == "/register.js"){
        // Return clientside scripts
        fs.readFile(request.url.substring(1), function(err, data){
            response.setHeader("Content-Type", "text/plain");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }
})

const port = process.env.PORT || 3000; // Look for a environment variable "PORT" or default to port 3000
server.listen(port, "localhost", function(){ // Listen for requests on localhost:port
    console.log("The server is now running at localhost:" + port);
});