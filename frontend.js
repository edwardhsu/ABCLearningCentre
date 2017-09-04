var default_content="";
var curList="";
var lasturl="";
var firstname="";
var lastname="";
var email="";
var course="";
var comment="";

setCookie("CC","SGD",30);
setCookie("CR",1,30);



$(document).ready(function(){
	checkURL();
	$('ul li a').click(function (e){
			checkURL(this.hash);
		});

	//filling in the default content
	default_content = $('#pageContent').html();

	setInterval("checkURL()",250);

});

function checkURL(hash)
{
	if(!hash) hash=window.location.hash;

	if(hash != lasturl)
	{
		lasturl=hash;
		// FIX - if we've used the history buttons to return to the homepage,
		// fill the pageContent with the default_content
		if(hash==""){
		$('#pageContent').html(default_content);

		}
		else{
		 if(hash=="#courses"){
			 loadCourses();
		 }
		 else if(hash=="#details"){
			 openCourse();
		 }
		 else if(hash=="#lead"){
			 leadGen();
		 }
		 else if(hash=="#schedule"){
			 courseSche();
		 }
		 else if(hash=="#thank"){
			 thankyou();
		 }
		 else
		   loadPage(hash);
		}
	}
}


function loadPage(url)
{
	url=url.replace('#page','');

	$('#loading').css('visibility','visible');

	$.ajax({
		type: "POST",
		url: "load_page.py",
		data: 'page='+url,
		dataType: "html",
		success: function(msg){

			if(parseInt(msg)!=0)
			{
				$('#pageContent').html(msg);
				$('#loading').css('visibility','hidden');
			}
		}
	});
}

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function currencyCode() {
	var selection = document.getElementById("currencyID");
	var selectedCur = selection.options[selection.selectedIndex].value;

	var jsonURL = "currency.json";

	$.getJSON(jsonURL, function (json)
	{
		$.each(json.currencies, function () {
			if(selectedCur==this.code)
				curRate=parseFloat(this.conversion);
		 });
		 setCookie("CC",selectedCur,30);
		 setCookie("CR",curRate,30);

		 if(window.location.hash=="#courses")
		  loadCourses();
		 else if(window.location.hash=="#details")
		  openCourse();

  	});
}

function loadCurrency() {
	var jsonURL = "currency.json";
	var curCode = getCookie("CC");

  	$.getJSON(jsonURL, function (json)
  	{
     	curList= "<div class=\"currency\"><select id=\"currencyID\" onchange=\"currencyCode()\">";
	    $.each(json.currencies, function () {
				if (this.code==curCode) {
	      	curList += '<option value=\'' + this.code + '\' selected>' + this.name + '</option>';
				}
				else {
					curList += '<option value=\'' + this.code + '\'>' + this.name + '</option>';
				}
    	});
    	curList+='</select></div>'

		});
}

function loadCourses() {
  	$('#loading').css('visibility','visible');
  	var jsonURL = "courses.json";

		loadCurrency();
		var curCode = getCookie("CC");

  	$.getJSON(jsonURL, function (json)
  	{
   	 	var imgList= "<div class=\"course\"><ul class=\"courses\">";
    	$.each(json.courses, function () {
      	/*imgList += '<li><img src= "' + this.imgPath + '"><h3><a href="javascript:openCourse(\''+ this.name + '\')">' + this.name + '</a>   ' + curCode + this.price + '</h3></li>';*/
				var convert = this.price * getCookie("CR");
				imgList += '<li><img src= "' + this.imgPath +
										'"><h3><a href="#details" onclick="sessionStorage.setItem(\'selectCourse\',\'' +
										this.name + '\');">' + this.name + '</a></h3><h2><p id=\"codeID\">' + curCode +
										'</p><p id=\"priceID\">' + convert + '</p></h2></li>';
    	});
    	imgList+='</ul></div>'
			imgList =curList + imgList;

   		$('#pageContent').html(imgList);
   		$('#loading').css('visibility','hidden');
  	});
}

function openCourse () {
	$('#loading').css('visibility','hidden');
	var jsonURL = "courses.json";

	loadCurrency();
	var curCode = getCookie("CC");
	var selectedCourse = sessionStorage.getItem('selectCourse');

	$.getJSON(jsonURL, function (json)
	{
	   	var course = "<div class=\"courseDetails\"><table class=\"courseDetails\">";
	    $.each(json.courses, function () {
				if (selectedCourse == this.name) {
					var convert = this.price * getCookie("CR");
					course += '<tr><td><img src= ' + this.imgPath + '></td><td>' +
											this.summary + '</td></tr><tr><td><h1>' + this.name +
											'</h1></td><td><div id=\"enquiry\"><p id=\"codeID\">' +
											curCode + '</p><p id=\"priceID\">' + convert +
											'</p><button class=\"btn\" id=\"scheBut\" onclick=\"window.location.hash=\'#schedule\';\">Course Schedule</button>' +
											'<button class=\"btn\" id=\"enquiryBut\" onclick=\"window.location.hash=\'#lead\';\">Course Enquiry</button></div></td></tr>';
						}
			});
	    course+='</table></div>'
			course =curList + course;

		$('#pageContent').html(course);
		$('#loading').css('visibility','hidden');
	});
}

function leadGen () {

	$('#loading').css('visibility','hidden');
	var jsonURL = "courses.json";
	var selectedCourse = sessionStorage.getItem('selectCourse');

	$.getJSON(jsonURL, function (json)
	{
		var leadFrm= "<form method=\"post\" id=\"frmLead\">" +
									"<h1>Course Enquiry</h1>" +
									"<table class=\"lead\"><tbody><tr><td>*First Name</td>" +
									"<td><input class=\"txtInput\" id=\"firstNTxt\" value=\"" + firstname + "\"></td></tr>" +
									"<tr><td>*Last Name</td>" +
									"<td><input class=\"txtInput\" id=\"lastNTxt\" value=\"" + lastname + "\"></td></tr>" +
									"<tr><td>*Email</td>" +
									"<td><input class=\"txtInput\" id=\"emailTxt\" value=\"" + email + "\"></td></tr>" +
									"<tr><td>Course</td>" +
									"<td><select class=\"txtInput\" id=\"courseID\">";

		$.each(json.courses, function () {
			if (this.name==selectedCourse) {
				leadFrm += '<option value=\'' + this.name + '\' selected>' + this.name + '</option>';
			}
			else {
				leadFrm += '<option value=\'' + this.name + '\'>' + this.name + '</option>';
			}
		});
		leadFrm+="</select><br></td></tr>" +
							"<tr><td>Comment</td>" +
							"<td><textarea rows=\"3\" cols=\"50\" id=\"commTxt\" value=\"" + comment + "\"></textarea></td></tr>" +
							"<tr><td></td><td><button class=\"btn\" id=\"backBut\" onclick=\"window.location.hash=\'#details\';\">Back</button>" +
							"<button id=\"submit\" style=\"float: right;\" onclick=\"return validateInput()\">Submit</button>" +
							"<input value=\"Clear\" type=\"reset\" style=\"float: right;\"></td></tr>" +
							"</tbody></table></form>"

		$('#pageContent').html(leadFrm)
		$('#loading').css('visibility','hidden');
	});
}

function courseSche () {

	$('#loading').css('visibility','hidden');
	var jsonURL = "courses.json";
	var selectedCourse = sessionStorage.getItem('selectCourse');

	$.getJSON(jsonURL, function (json)
	{
		var schedule= "<h1>Course Schedule</h1>" +
									"<br><div class=\"courseSchedule\"><table class=\"schedule\"><tbody><tr><th>Name</th>" +
									"<th>Start Date to End Date</th><th>Duration</th><th>Session</th><th>Available Seats</th><th>Venue</th></tr><tr>";

		$.each(json.courses, function () {
			if (this.name==selectedCourse) {
				schedule += '<td>' + this.name + '</td>' +
										'<td>' + this.schedule.startDate + '</td>' +
										'<td>' + this.schedule.duration + '</td>' +
										'<td>' + this.schedule.session + '</td>' +
										'<td>' + this.schedule.availableSeat + '</td>' +
										'<td>' + this.schedule.venue + '</td>';
			}
		});
		schedule+="</tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>" +
							"<tr><td></td><td></td><td></td><td></td>" +
							"<td colspan=\"2\"><button class=\"btn\" id=\"enquiryBut\" onclick=\"window.location.hash=\'#lead\';\">Course Enquiry</button>" +
							"<button class=\"btn\" id=\"backBut\" onclick=\"window.location.hash=\'#details\';\">Back</button></td></div></td></tr>" +
							"</tbody></table></div>";

		$('#pageContent').html(schedule)
		$('#loading').css('visibility','hidden');
	});
}

function validateInput() {
	var status=true;
	var msg="";

	var input = document.forms["frmLead"]["firstNTxt"].value;
	if (input == "") {
			msg="Invalid First Name\n";
		  status=false;
	}
	else{
		msg="";
	}

	input=document.forms["frmLead"]["lastNTxt"].value;
	if(input==""){
		msg+="Invalid Last Name\n";
		status=false;
	}
	else{
		msg+="";
	}

	input=document.forms["frmLead"]["emailTxt"].value;
	if(input==""){
		msg+="Enter a Valid Email\n";
		status=false;
	}
	else{
		msg+="";
	}

	if(!validateEmail(input))
	{
		msg+= input + " Invalid Email Address\n";
		status=false;
	}

	if (status) {

		window.location.hash='#thank';
		
		$(function()
		{
			var jsonData = {
				"firstName": document.forms["frmLead"]["firstNTxt"].value,
				"lastName": document.forms["frmLead"]["lastNTxt"].value,
				"email": document.forms["frmLead"]["emailTxt"].value,
				"course": document.forms["frmLead"]["courseID"].value,
				"comment": document.forms["frmLead"]["commTxt"].value
			};
			var dataPost =[];
			dataPost = JSON.stringify(jsonData);

			$.ajax({
					type: 'POST',
					data: dataPost,
					url: 'save.py',
					success: function(){
						window.location.hash='#thank';
					},
					error: function(){
						alert("Error!");
					}
			});
	});
}
else {
	alert (msg);
	return status;
	}
}

function validateEmail(email)
{
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
}

function thankyou(){

	$('#loading').css('visibility','visible');
	var thank = "<p>Thank you for your interest. We will response to your query shortly</p>";

	$('#pageContent').html(thank);

}

var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
	showDivs(slideIndex += n);
}

function showDivs(n) {
	var i;
	var x = document.getElementsByClassName("mySlides");
	if (n > x.length) {slideIndex = 1}
	if (n < 1) {slideIndex = x.length}
	for (i = 0; i < x.length; i++) {
		 x[i].style.display = "none";
	}
	x[slideIndex-1].style.display = "block";
}
