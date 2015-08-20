/**
* Copyright 2015 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var dbName = "REPLACE_ME_WITH_THE_DATABASE_NAME";
var auth = "Basic REPLASE_ME_WITH_THE_BASE-64_ENCODED_STRING";

function onAuthRequired(headers, errorMessage){
	errorMessage = errorMessage ? errorMessage : null;
	return {
		authRequired: true,
		authStep: 1,
		errorMessage: errorMessage
	};
}

function submitAuthenticationStep1(username, password){
	if (username === "user" && password === "password"){
		WL.Logger.debug("Step 1 :: SUCCESS");
		var clientId = WL.Server.getClientId();
		var userIdentity = {
				userId: username,
				displayName: username, 
				attributes: {}
		};
		
		//Validate that the DB doesn't already contains the ClientId
		var response = deleteUserIdentityFromDB(dbName, null);
				
		//Write ClientId to DB
		var response = writeUserIdentityToDB(dbName, {_id:clientId, "userIdentity":userIdentity});
		if (response){
			return {
				authRequired: true,
				authStep: 2,
				question: "What is your pet's name?",
				errorMessage : ""
			};
		} else {
			return onAuthRequired(null, "Database ERROR");
		}
	
	} else{
		WL.Logger.debug("Step 1 :: FAILURE");
		return onAuthRequired(null, "Invalid login credentials");
	}
}

function submitAuthenticationStep2(answer){
	var clientId = WL.Server.getClientId();	
	var response = readUserIdentityFromDB(dbName, clientId);
	if (response){
		if (answer === "Lassie"){
			var doc = JSON.parse(response.text);
			var userIdentity = doc.userIdentity;
			WL.Logger.debug("Step 2 :: SUCCESS");
			WL.Server.setActiveUser("TwoStepAuthRealm", userIdentity);
			WL.Logger.debug("Authorized access granted");
			
			var response = deleteUserIdentityFromDB(dbName, doc); 
			
			return {
				authRequired: false
			};
		} else{
			WL.Logger.debug("Step 2 :: FAILURE");
			return onAuthRequired(null, "Wrong security question answer");
		}
	} else {
		WL.Logger.debug("Step 1 :: FAILURE");
		return onAuthRequired(null, "Database ERROR");
	}
		
}

function getSecretData(){
	return {
		secretData: "Very very very very secret data"
	};
}

function onLogout(){
	WL.Logger.debug("Logged out");
}


function writeUserIdentityToDB(db, document){
	   var input = {
			   	method : 'post',
		        returnedContentType : 'plain',
		        path : db,
		        headers: {
		        	"Authorization":auth
		        },
		        body:{
		        	contentType:'application/json; charset=UTF-8',
		        	content:JSON.stringify(document)
		    }};

		 var response = WL.Server.invokeHttp(input);
		 var responseString = "" + response.statusCode;
		 
		//Checking if the invocation was successful - status code = 2xx
		 if (responseString.indexOf('2') === 0){
			 return response;
		 }
		 return null;
}


function deleteUserIdentityFromDB(db, document){
	var doc = document;
	if (!doc){
		var clientId = WL.Server.getClientId();
		var response = readUserIdentityFromDB(dbName, clientId);
		if(!response){
			return;
		} else {
			doc = JSON.parse(response.text);
		}
	}
	var id = doc._id; // The id of the doc to remove
	var rev = doc._rev; // The rev of the doc to remove
	var input = {
		        method : 'delete',
		        returnedContentType : 'plain',
		        path : db + "/" + id + "?rev=" + rev,
		        headers: {
		        	"Authorization":auth		        
		        	}
		    };
	 return WL.Server.invokeHttp(input);

}

function readUserIdentityFromDB(db, key){
	 var input = {
		        method : 'get',
		        returnedContentType : 'plain',
		        path : db + "/" + key,
		        headers: {
		        	"Authorization":auth		        }
		    };
	 var response = WL.Server.invokeHttp(input);
	 var responseString = "" + response.statusCode;
	 
	 //Checking if the invocation was successful - status code = 2xx
	 if (responseString.indexOf('2') === 0){
		 return response;
	 }
	 return null;
}


