const mongoDB = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");
var liveDatabase;

mongoDB.connect("mongodb://localhost:27017/LoginData", function(err, db){
    if(err){console.log("An error occured when connecting to the database."); throw err;}
    liveDatabase = db.db("LoginDatabase");
    console.log("Connected to the MongoDB server.");
})

function searchForAccount(sendExtraData, nameInput, passwordInput, sessionInput){
    if(sendExtraData == true){
        liveDatabase.collection("accounts").findOne({session: sessionInput}, function(err, data){
            if(err){throw err};
            console.log("data", data);
        })
    }else{
        return liveDatabase.collection("accounts").findOne({name: nameInput}, function(err, data){
            if(err){console.log(err); return false;};
            console.log("data", data);
            bcrypt.compare(passwordInput, data["password"], function(bcryptErr, result) {
                // Compare the inputed password to the password hash to see if its the right password.
                if(bcryptErr){console.log(bcryptErr); return false;};

                console.log("compare result:", result);
                if(result == true){
                    // Password is correct since hash matches
                    return true;
                }else{
                    return false;
                }
            });
        })
    }
}

function getTime(){
    let currentTime = new Date();
    let returnData = String(currentTime.getMonth() + 1) + "/" + String(currentTime.getDate()) + "/" + String(currentTime.getFullYear()) + " - " + String(currentTime.getHours()) + ":" + String(currentTime.getMinutes()) + ":" + String(currentTime.getSeconds())
    return returnData;
}

function updateToken(targetName, newSessionToken){
    liveDatabase.collection("accounts").UpdateOne({name: targetName}, {$set: {session: newSessionToken}}, function(err, response){
        if(err){throw err};
    })
}

function registerAccount(nameInput, passwordInput, currentSession){
    bcrypt.hash(passwordInput, 5, function(err, hash) {
        // Store hash in your password DB.
        if(err){throw err};
        let currentTime = getTime()
        liveDatabase.collection("accounts").insertOne({name: nameInput, password: hash, session: currentSession, registration_time: currentTime}, function(err2, res){
            if(err2){throw err2};
            console.log("inserted bob");
        })
    });
}

module.exports.searchForAccount = searchForAccount;
module.exports.registerAccount = registerAccount;
module.exports.updateToken = updateToken;