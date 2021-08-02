const http = require("http");
const fs = require("fs");
const db = require("./databaseFunctions.js");

function generateSessionToken(){
    let characters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890"
    let returnToken = ""
    for(let i = 0; i < 50; i++){
        returnToken = returnToken + characters[Math.floor(Math.random() * characters.length)]
    }
    return returnToken;
}

const server = http.createServer(function(request, response){
    console.log("Received request at: " + request.url);
    //req.headers["sessionToken"]
    if(request.url == "/api/login" && request.headers["name"] != null && request.headers["password"] != null){
        response.setHeader("Content-Type", "application/json");
        let QueryDatabase = new Promise(async function(resolve, reject){
            let checkLogin = await db.searchForAccount(false, String(request.headers["name"]), String(request.headers["password"]));
            if(checkLogin != null){
                if(checkLogin == true){
                    let newToken = generateSessionToken();
                    db.updateToken(String(request.headers["name"]), newToken) // Have the whitelist update the session token
                    response.write({success: true, token: newToken});
                    response.end();
                }else{
                    response.write({success: false});
                    response.end();
                }
            }
        })
        response.end();
    }else if(request.url == "/api/register"){
        response.setHeader("Content-Type", "application/json");
        response.end();
    }else if(request.url == "/" || request.url == "/index"){
        fs.readFile("index.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/my/profile"){
        fs.readFile("profile.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            db.searchForAccount(false, "bob2", "password1234")
            //db.registerAccount("bob2", "password123");
            response.end();
        })
    }else if(request.url == "/my/settings"){
        fs.readFile("settings.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/login"){
        fs.readFile("login.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
    }else if(request.url == "/register"){
        fs.readFile("register.html", function(err, data){
            response.setHeader("Content-Type", "text/html");
            if(err){data = "An unknown error occured."; console.log(err)};
            response.write(data);
            response.end();
        })
})

const port = process.env.PORT || 3000; // Look for a environment variable "PORT" or default to port 3000
server.listen(port, "localhost", function(){ // Listen for requests on localhost:port
    console.log("The server is now running at localhost:" + port);
});