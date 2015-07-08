/*
*
    COPYRIGHT LICENSE: This information contains sample code provided in source code form. You may copy, modify, and distribute
    these sample programs in any form without payment to IBM® for the purposes of developing, using, marketing or distributing
    application programs conforming to the application programming interface for the operating platform for which the sample code is written.
    Notwithstanding anything to the contrary, IBM PROVIDES THE SAMPLE SOURCE CODE ON AN "AS IS" BASIS AND IBM DISCLAIMS ALL WARRANTIES,
    EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY,
    FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND ANY WARRANTY OR CONDITION OF NON-INFRINGEMENT. IBM SHALL NOT BE LIABLE FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR OPERATION OF THE SAMPLE SOURCE CODE.
    IBM HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS OR MODIFICATIONS TO THE SAMPLE SOURCE CODE.

*/

var doubleStepAuthRealmChallengeHandler = WL.Client.createChallengeHandler("DoubleStepAuthRealm");

doubleStepAuthRealmChallengeHandler.isCustomResponse = function(response) {
	if (!response || !response.responseJSON	|| response.responseText === null) {
		return false;
	}
	if (typeof(response.responseJSON.authRequired) !== 'undefined'){
		return true;
	} else {
		return false;
	}
};

doubleStepAuthRealmChallengeHandler.handleChallenge = function(response){
	var authRequired = response.responseJSON.authRequired;

	if (authRequired == true){
		$("#AppDiv").hide();
		$("#AuthDiv").show();
		$("#AuthInfo").empty();
		
		$("#AuthStep1Div").hide();
		$("#AuthStep2Div").hide();
		switch (response.responseJSON.authStep) {
			case 1:
				$("#AuthStep1Div").show();
				$("#AuthPassword").val('');
				break;
			case 2:
				$("#AuthStep2Div").show();
				$("#AuthAnswer").val('');
				$("#AuthQuestion").html(response.responseJSON.question);
				break;
		}

		if (response.responseJSON.errorMessage)
			$("#AuthInfo").html(response.responseJSON.errorMessage);
		
	} else if (authRequired == false){
		$("#AppDiv").show();
		$("#AuthDiv").hide();
		doubleStepAuthRealmChallengeHandler.submitSuccess();
	}
};


$("#AuthStep1Submit").bind('click', function () {
	var username = $("#AuthUsername").val();
	var password = $("#AuthPassword").val();

	var invocationData = {
		adapter : "AuthAdapter",
		procedure : "submitAuthenticationStep1",
		parameters : [ username, password ]
	};

	doubleStepAuthRealmChallengeHandler.submitAdapterAuthentication(invocationData, {});
});

$("#AuthStep2Submit").bind('click', function () {
	var answer = $("#AuthAnswer").val();

	var invocationData = {
		adapter : "AuthAdapter",
		procedure : "submitAuthenticationStep2",
		parameters : [ answer ]
	};

	doubleStepAuthRealmChallengeHandler.submitAdapterAuthentication(invocationData, {});
});

$(".AuthCancelButton").bind('click', function () {
	$("#AppDiv").show();
	$("#AuthDiv").hide();
	doubleStepAuthRealmChallengeHandler.submitFailure();
});


