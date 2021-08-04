// Script that handles all database functions in the app

const mongoDB = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");
var liveDatabase;

mongoDB.connect("mongodb://localhost:27017/LoginData", function(err, db){
    if(err){console.log("An error occured when connecting to the database."); throw err;}
    liveDatabase = db.db("LoginDatabase");
    // Link to the MongoDB database and save it for later use
    console.log("Connected to the MongoDB server.");
})

function loginAccountSearch(nameInput){
    // Query database using name to get the password hash to compare it with inputted password
    return liveDatabase.collection("accounts").find({name: nameInput}, {projection:{ _id: 0, registration_time: 0}}).toArray().then(function(data){
        return data[0];
    }).catch(function(){
        return false;
    })
}

function searchForAccount(nameInput){
    // Query database to determine if an account already exists, return any data that is found
    return liveDatabase.collection("accounts").find({name: nameInput}, {projection:{ _id: 0 }}).toArray().then(function(data){
        return data[0];
    }).catch(function(err){
        throw err;
    })
}

function getAccountData(token){
    // Query database for account data other than login/password so we can populate client's webpages with data
    return liveDatabase.collection("accounts").find({session: token}, {projection: { _id: 0, password: 0 }}).toArray().then(function(data){
        return data[0];
    }).catch(function(){
        return false;
    })
}

function getTime(){
    // Get the current date and time and return it in a "useable" format
    let currentTime = new Date();
    let returnData = String(currentTime.getMonth() + 1) + "/" + String(currentTime.getDate()) + "/" + String(currentTime.getFullYear()) + " - " + String(currentTime.getHours()) + ":" + String(currentTime.getMinutes()) + ":" + String(currentTime.getSeconds())
    return returnData;
}

function updateToken(targetName, newSessionToken){
    // Tell database to update a specific document's token to facilitate new session token usage
    liveDatabase.collection("accounts").updateOne({name: targetName}, { $set: {session: newSessionToken}}, function(err, res) {
        if (err){throw err};
    });
}

function registerAccount(nameInput, passwordHash, currentSession){
    // Create a new database document with specified information so that the user can use and log into their account
    let currentTime = getTime()
    liveDatabase.collection("accounts").insertOne({name: nameInput, password: passwordHash, session: currentSession, registration_time: currentTime}, function(err2, res){
        console.log("New account was inserted");
    })
}

module.exports.searchForAccount = searchForAccount;
module.exports.registerAccount = registerAccount;
module.exports.updateToken = updateToken;
module.exports.getAccountData = getAccountData;
module.exports.loginAccountSearch = loginAccountSearch;