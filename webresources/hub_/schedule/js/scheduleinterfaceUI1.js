
(function(){
var data = new Data();

var enrollmentObject = data.getEnrollmentDetails();
//enrollmentObject contains the below params
//hub_location
//hub_service
//hub_enrollmentid
//hub_student
//hub_enrollmentstartdate
//hub_enrollmentenddate
//duration 
//hub_committedsessions

var disableddates = [];
var timingsData = data.getTimings();
var existingData = data.getExistingSchedules();

timingsData = ( timingsData == null ) ? [] : timingsData;
existingData = ( existingData == null ) ? [] : existingData;

var arr = [];
timingsData.map(function(x){
	arr.push(x['hub_days']);
	return x['hub_days']});

var filteredArray = arr.filter(function(item, pos){
  return arr.indexOf(item)== pos; 
});


function convertMinsNumToTime(minsNum){
  	if(minsNum){
        // var mins_num = parseFloat(this, 10); // don't forget the second param
        var hours   = Math.floor(minsNum / 60);
        var minutes = Math.floor((minsNum - ((hours * 3600)) / 60));
        var seconds = Math.floor((minsNum * 60) - (hours * 3600) - (minutes * 60));

        // Appends 0 when unit is less than 10
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes;
  	}
}

function tConvert(time) {
  	time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  	if (time.length > 1) { 
        time = time.slice (1);  
        time[5] = +time[0] < 12 ? ' AM' : ' PM'; 
        time[0] = +time[0] % 12 || 12; 
  	}	
  	return time.join (''); 
}

var businessClosures = data.getBusinessClosure();
if(businessClosures != null && businessClosures.length){
	for (var i = 0; i < businessClosures.length; i++) {
		var startDate = businessClosures[i]['hub_startdatetime@OData.Community.Display.V1.FormattedValue'];
		var endDate =businessClosures[i]['hub_enddatetime@OData.Community.Display.V1.FormattedValue'];
		startDate = startDate.split('/');
		endDate = endDate.split('/');
		var businessClosureStartDate = new Date(startDate[2],startDate[0]-1,startDate[1]);
		var businessClosureEndDate = new Date(endDate[2],endDate[0]-1,endDate[1]);
		if(businessClosureStartDate.getTime() == businessClosureEndDate.getTime()){
			disableddates.push(moment(businessClosureStartDate).format('YYYY-MM-DD'));
		}
		else{
			for (var j = businessClosureStartDate.getTime(); j <= businessClosureEndDate.getTime(); j+=(24*60*60*1000)) {
				disableddates.push(moment(new Date(j)).format('YYYY-MM-DD'));
			}
		}
	}
}
	// var enrollmentEndDt = getQueryParm();
	var max1Date = enrollmentObject.hub_enrollmentenddate == "undefined" ? null : new Date(enrollmentObject.hub_enrollmentenddate);
	var min1Date = enrollmentObject.hub_enrollmentstartdate == "undefined" ? null : new Date(enrollmentObject.hub_enrollmentstartdate);
	var dateOptions = {
			minDate: min1Date,
			maxDate:max1Date,
			changeMonth: true,
  			changeYear: true,
  			beforeShowDay : DisableSpecificDates,
  			onSelect: function(dateText,e) {
  				$(this).removeAttr('style');
  				$(this).removeAttr('data-original-title');
  				var parentDiv = $(this).parents()[1];
  				if (!$(parentDiv).hasClass("dirty")) {
  				    $(parentDiv).addClass("dirty");
  				}
  				var selectedId = $(this).attr("id");
  				if(selectedId.includes("start")){
  					selectedId = selectedId.replace("start", "end");
  				}else{
  					selectedId = selectedId.replace("end", "start");
  				}
  				$("#"+selectedId).removeAttr('style');
  				$("#"+selectedId).removeAttr('data-original-title');
  				if($(e)[0].id.indexOf('start-datepicker') != -1){	
		        	populateTimings(new Date(dateText),e.id.split("-")[0],e.id.split("-")[3],true)
  				}
		    }
		};
	var day;
	var dayArray = [
		{
			dayId : 1,
			dayValue : "Monday",
			dayCode :"mon"
		},
		{
			dayId : 2,
			dayValue : "Tuesday",
			dayCode :"tue"
		},
		{
			dayId : 3,
			dayValue : "Wednesday",
			dayCode :"wed"
		},
		{
			dayId : 4,
			dayValue : "Thursday",
			dayCode :"thu"
		},
		{
			dayId : 5,
			dayValue : "Friday",
			dayCode :"fri"
		},
		{
			dayId : 6,
			dayValue : "Saturday",
			dayCode :"sat"
		},
		{
			dayId : 7,
			dayValue : "Sunday",
			dayCode :"sun"
		}
	];

	var unAvailableDays = [];
	for (var i = 0; i < dayArray.length; i++) {
		var index = filteredArray.map(function(x){return x;}).indexOf(dayArray[i].dayId);
		if(index == -1){
			unAvailableDays.push(dayArray[i].dayId)
		}
	}
	for (var i = 0; i < unAvailableDays.length; i++) {
		$('table tr:nth-child('+(unAvailableDays[i]+1)+')').addClass('disableRow');
	}

	
	for (var i = 0; i < dayArray.length; i++) {
		day = dayArray[i].dayCode;

		var filterByDay = existingData.filter(function(x){
			return x.hub_days == dayArray[i].dayId;
		});
		var index = 0;
		if(filterByDay.length > 0){
			for (var j = 0; j < filterByDay.length; j++) {
				index = j;
				var startDate = moment(moment(filterByDay[j]['hub_effectivestartdate']).format('YYYY-MM-DD')).format('MM/DD/YYYY');
				var endDate = null;
				if(filterByDay[j]['hub_effectiveenddate'] != undefined && filterByDay[j]['hub_effectiveenddate'] != ""){
					endDate = moment(moment(filterByDay[j]['hub_effectiveenddate']).format('YYYY-MM-DD')).format('MM/DD/YYYY');
				}
				var startTime = tConvert(convertMinsNumToTime(filterByDay[j]["hub_starttime"]));
				var endTime = tConvert(convertMinsNumToTime(filterByDay[j]["hub_endtime"]));

				var template = '<div id="'+filterByDay[j]['hub_timingsid']+'" class="'+day+'-'+index+'">'+
								'<div class="picker">'+
									'<input type="text" disabled value="'+startDate+'" id="'+day+'-start-datepicker-'+index+'">'+
								'</div>'+
								'<div class="picker">'+
									'<input type="text" id="'+day+'-end-datepicker-'+index+'">'+
								'</div>'+
								'<div class="picker">'+
									'<div id="'+day+'-start-timepicker-'+index+'" class="timing-dropdown btn-group">'+
							            '<button disabled value="'+startTime+'" id="'+day+'-start-timepicker-'+index+'-btn" class="btn dropdown-toggle timing-dropdown-btn" data-toggle="dropdown">'+
							            startTime+
							          '</button>'+
							          '<ul class="dropdown-menu"></ul>'+
							        '</div>'+
								'</div>'+
								'<div>'+
									'<div class="end-time">'+
										'<button id="end-time-'+day+'-'+index+'" class="btn" disabled value="'+endTime+'" >'+endTime+'</button>' +
									'</div>'+
								'</div>'+
								'<div class="remove_img existingRecord visibility-off">'+
									'<img x-id="'+day+'-'+index+'" day="'+day+'"id="remove-'+day+'-'+index+'" src="/webresources/hub_/schedule/images/close.png">'+
								'</div>';
				if(!j){
					template+= 	'<div class="add_img">'+
									'<img day="'+day+'"id="add_'+day+'_row" src="/webresources/hub_/schedule/images/add_circle.png">'+
								'</div>'+
							'</div>';
				}				
				$("#"+day+"-td").append(template);		
				$("#"+day+"-start-datepicker-"+index ).datepicker(dateOptions);
				$("#"+day+"-end-datepicker-"+index ).datepicker(dateOptions);
				if(endDate != null){
					$("#"+day+"-end-datepicker-"+index).datepicker( "setDate", endDate );
				}
				populateTimings(new Date(filterByDay[j]['hub_effectivestartdate']),day,index,false);
			}
		}
		else{
			var template = '<div class="'+day+'-'+index+'">'+
							'<div class="picker">'+
								'<input type="text" id="'+day+'-start-datepicker-'+index+'">'+
							'</div>'+
							'<div class="picker">'+
								'<input type="text" id="'+day+'-end-datepicker-'+index+'">'+
							'</div>'+
							'<div class="picker">'+
								'<div id="'+day+'-start-timepicker-'+index+'" class="timing-dropdown btn-group">'+
						            '<button id="'+day+'-start-timepicker-'+index+'-btn" class="btn dropdown-toggle timing-dropdown-btn" data-toggle="dropdown">'+
						            '<span class="caret"></span>'+
						          '</button>'+
						          '<ul class="dropdown-menu"></ul>'+
						        '</div>'+
							'</div>'+
							'<div>'+
								'<div class="end-time" >'+
									'<button id="end-time-'+day+'-'+index+'" class="btn" disabled></button>' +
								'</div>'+
							'</div>'+
							'<div class="remove_img visibility-off">'+
								'<img x-id="'+day+'-'+index+'" day="'+day+'"id="remove-'+day+'-'+index+'" src="/webresources/hub_/schedule/images/close.png">'+
							'</div>'+
							'<div class="add_img">'+
								'<img day="'+day+'"id="add_'+day+'_row" src="/webresources/hub_/schedule/images/add_circle.png">'+
							'</div>'+
						'</div>';
			$("#"+day+"-td").append(template);		
			$("#"+day+"-start-datepicker-"+index ).datepicker(dateOptions);
			$("#"+day+"-end-datepicker-"+index ).datepicker(dateOptions);
		}
	}

	$('body').on('click', '.add_img img',function(){
		var day = $(this).attr('day');
		var index = $("#"+$(this).attr('day')+"-td").children().length;
		var template = '<div class="'+day+'-'+index+'">'+
							'<div class="picker">'+
								'<input type="text" id="'+day+'-start-datepicker-'+index+'">'+
							'</div>'+
							'<div class="picker">'+
								'<input type="text" id="'+day+'-end-datepicker-'+index+'">'+
							'</div>'+
							'<div class="picker">'+
								'<div id="'+day+'-start-timepicker-'+index+'" class="timing-dropdown btn-group">'+
					            	'<button id="'+day+'-start-timepicker-'+index+'-btn" class="btn dropdown-toggle timing-dropdown-btn" data-toggle="dropdown">'+
					            		'<span class="caret"></span>'+
					          		'</button>'+
					          		'<ul class="dropdown-menu"></ul>'+
					        	'</div>'+
							'</div>'+
							'<div>'+
								'<div class="end-time" >'+
									'<button id="end-time-'+day+'-'+index+'" class="btn" disabled></button>'+
								'</div>'+
							'</div>'+
							'<div class="remove_img visibility-off">'+
								'<img x-id="'+day+'-'+index+'" day="'+day+'"id="remove-'+day+'-'+index+'" src="/webresources/hub_/schedule/images/close.png">'+
							'</div>'+
						'</div>';
		$("#"+day+"-td").append(template);		
		$("#"+day+"-start-datepicker-"+index ).datepicker(dateOptions);
		$("#" + day + "-end-datepicker-" + index).datepicker(dateOptions);
		$(".picker .hasDatepicker").attr("readonly", "readonly");
		if(index >= 1){
			$("#"+day+"-td .remove_img").each(function(){
				if(!$(this).hasClass('existingRecord')){
					$(this).removeClass('visibility-off');
					$(this).addClass('visibility-on');
				}
			});
		}
	});

	$('body').on('click', '.remove_img img', function() {
		var rowId = $(this).attr('x-id');
		var day = rowId.split('-')[0];
		var index = rowId.split('-')[1];
	    $('.'+rowId).remove();
	    var childrens = $("#"+day+"-td").children();
	    for (var i = parseInt(index); i < childrens.length; i++) {
	    	$("#"+day+"-start-datepicker-"+(i+1) ).datepicker("destroy");
			$("#"+day+"-end-datepicker-"+(i+1) ).datepicker("destroy");
	    	$(childrens[i]).attr('class',day+'-'+i);
	    	$(childrens[i]).find('#'+day+'-start-datepicker-'+(i+1)).attr('id',day+'-start-datepicker-'+i);
	    	$(childrens[i]).find('#'+day+'-end-datepicker-'+(i+1)).attr('id',day+'-end-datepicker-'+i);
	    	$(childrens[i]).find('#'+day+'-start-timepicker-'+(i+1)).attr('id',day+'-start-timepicker-'+i);
	    	$(childrens[i]).find('#'+day+'-start-timepicker-'+(i+1)+"-btn").attr('id',day+'-start-timepicker-'+i+"-btn");
	    	$(childrens[i]).find('#end-time-'+day+'-'+(i+1)).attr('id','end-time-'+day+'-'+i);
	    	$(childrens[i]).find('#remove-'+day+'-'+(i+1)).attr('id','remove-'+day+'-'+i).attr('x-id',day+'-'+i);
	    	if(!i){
	    		var addImgTemplate = '<div class="add_img">'+
										'<img day="'+day+'"id="add_'+day+'_row" src="/webresources/hub_/schedule/images/add_circle.png">'+
									'</div>';
	    		$(childrens[i]).find('.remove_img').after(addImgTemplate);
	    	}
	    	$("#"+day+"-start-datepicker-"+i ).datepicker(dateOptions);
			$("#"+day+"-end-datepicker-"+i ).datepicker(dateOptions);
	    }
	    if(childrens.length == 1){
			$("#"+day+"-td .remove_img").removeClass('visibility-on');
			$("#"+day+"-td .remove_img").addClass('visibility-off');
		}
	});

	$('#saveBtn').off('click').on('click',function(){
		var saveObj = [];
		$('.loading').css('height',window.outerHeight + "px");
		$('.loading').show();
		setTimeout(function(){
			var allowSave = true;
			var errorArry = [];
			for (var i = 0; i < dayArray.length; i++) {
				var childrens = $("#"+dayArray[i].dayCode+"-td").children();
				var dateArry = [];
				for (var j = 0; j < childrens.length; j++) {
					var startDate = $(childrens[j]).find('#'+dayArray[i].dayCode+'-start-datepicker-'+j).val();
					var startTime = $(childrens[j]).find('#'+dayArray[i].dayCode+'-start-timepicker-'+j+'-btn').val();
					var endDate = $(childrens[j]).find('#'+dayArray[i].dayCode+'-end-datepicker-'+j).val();
					var endTime = $(childrens[j]).find("#end-time-"+dayArray[i].dayCode+"-"+j).val();
					var isDisabled = $('#'+dayArray[i].dayCode+'-start-datepicker-'+j).prop('disabled');
					if (startDate.length) {
					    if ($(childrens[j]).find('#' + dayArray[i].dayCode + '-start-datepicker-' + j).hasClass("emptyPicker")) {
					        $(childrens[j]).find('#' + dayArray[i].dayCode + '-start-datepicker-' + j).removeClass("emptyPicker");
					        $(childrens[j]).find('#' + dayArray[i].dayCode + '-end-datepicker-' + j).removeClass("emptyPicker");
					    }
					    if ($(childrens[j]).find('#' + dayArray[i].dayCode + '-start-datepicker-' + j).hasClass("invalidDate")) {
					        $(childrens[j]).find('#' + dayArray[i].dayCode + '-start-datepicker-' + j).removeClass("invalidDate");
					        $(childrens[j]).find('#' + dayArray[i].dayCode + '-end-datepicker-' + j).removeClass("invalidDate");
					    }
						if(childrens.length > 1){
							var dateObj	= {
								startDate:startDate,
								startTime:startTime,
								endDate:endDate,
								endTime:endTime	
							};
							if(j>0){
								var res = validateDateOverlap(dateObj, dateArry);
								if(res){
									// if(!isDisabled){
										errorArry.push('#'+dayArray[i].dayCode+'-start-datepicker-'+j);
										errorArry.push('#'+dayArray[i].dayCode+'-end-datepicker-'+j);
									// }
								}
							}
						}
						dateArry.push({
							startDate:startDate,
							startTime:startTime,
							endDate:endDate,
							endTime:endTime	
						}); 
					}else{
						if(childrens.length > 1){
							var disableRow = $('#'+dayArray[i].dayCode+'-start-datepicker-'+j).parents("tr").hasClass("disableRow")
							if(!isDisabled && !disableRow){
								errorArry.push('#'+dayArray[i].dayCode+'-start-datepicker-'+j);
								errorArry.push('#' + dayArray[i].dayCode + '-end-datepicker-' + j);
								$('#' + dayArray[i].dayCode + '-start-datepicker-' + j).addClass("emptyPicker");
								$('#' + dayArray[i].dayCode + '-end-datepicker-' + j).addClass("emptyPicker");
							}
						}
					}					

					// var startDate = $(childrens[j]).find('#'+dayArray[i].dayCode+'-start-datepicker-'+j).val();
					if(startDate != '' && $('.'+dayArray[i].dayCode+'-'+j).hasClass("dirty")){
						var obj = {};
						obj["hub_enrollementid"]= enrollmentObject.hub_enrollmentid;
						startDate = moment(moment(startDate).format('MM/DD/YYYY')).format('YYYY-MM-DD')
						// var endDate = $(childrens[j]).find('#'+dayArray[i].dayCode+'-end-datepicker-'+j).val();
						if(endDate != ''){
							endDate = moment(moment(endDate).format('MM/DD/YYYY')).format('YYYY-MM-DD')
							if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
							    errorArry.push('#' + dayArray[i].dayCode + '-start-datepicker-' + j);
							    errorArry.push('#' + dayArray[i].dayCode + '-end-datepicker-' + j);
							    $('#' + dayArray[i].dayCode + '-start-datepicker-' + j).addClass("invalidDate");
							    $('#' + dayArray[i].dayCode + '-end-datepicker-' + j).addClass("invalidDate");
								prompt("One of the selected Start Date is greater than the End Date.","Error");
								allowSave = false;
								break;
							}
						}

						// var startTime = $(childrens[j]).find('#'+dayArray[i].dayCode+'-start-timepicker-'+j+'-btn').val();
						if(startTime == ""){
							startTime = $(childrens[j]).find('#'+dayArray[i].dayCode+'-start-timepicker-'+j+'-btn').text();
						}
						startTime = convertToMinutes(startTime);

						// var endTime = $(childrens[j]).find("#end-time-"+dayArray[i].dayCode+"-"+j).val();
						if(endTime == ""){
							endTime = $(childrens[j]).find("#end-time-"+dayArray[i].dayCode+"-"+j).text();
						}
						endTime = convertToMinutes(endTime);

						obj['hub_effectivestartdate'] = startDate;
						obj['hub_effectiveenddate'] = endDate;
						obj['hub_starttime'] = startTime;
						obj['hub_endtime'] = endTime;
						obj['hub_days'] = dayArray[i].dayId;
						if($(childrens[j]).attr('id') != ''){
							obj['hub_timingsid'] = $(childrens[j]).attr('id');
						}
						saveObj.push(obj);
					}
				}
			}

			if(errorArry.length){
				populateErrorField(errorArry);
				$('.loading').hide();
			}else{
				$(".hasDatepicker").removeAttr("data-original-title");
				$(".hasDatepicker").removeAttr("title");
				$(".hasDatepicker").removeAttr('style');
				if(saveObj.length && allowSave){
					var response = data.saveSchedules(saveObj,enrollmentObject);
					if(typeof(response) == 'boolean' && response){
						prompt('Schedules are saved Successfully.',"Success")
						$('.loading').hide();
					}
					else{
						prompt(response,"Error");
						$('.loading').hide();
					}
				}
				else if(saveObj.length == 0){
					prompt("Please add some data","Error");
					$('.loading').hide();
				}
				else{
					$('.loading').hide();
				}
			}
		},50);
	});

	$('#closeBtn').off('click').on('click',function(){
		window.close();
	});

	function validateDateOverlap(currentObj, dateList){
		var allow = false;
		if(currentObj.startDate.length == 0){
			allow = true;
		}else{
			if(dateList.length){
				var currStartObj = "";
				var currEndObj = "";
				if(currentObj.startTime.length){
					var stDateArry = moment(currentObj.startDate).format("YYYY-MM-DD").split("-");
                    var stTimeArry = convertMinsNumToTime(convertToMinutes(currentObj.startTime)).split(":");
					// currStartObj = new Date(currentObj.startDate+" "+currentObj.startTime);
					currStartObj = new Date(parseInt(stDateArry[0]),parseInt(stDateArry[1])-1,parseInt(stDateArry[2]),parseInt(stTimeArry[0]),parseInt(stTimeArry[1]));
				}
				if(currentObj.endDate.length && currentObj.endTime.length){
					var endDateArry = moment(currentObj.endDate).format("YYYY-MM-DD").split("-");
                    var endTimeArry = convertMinsNumToTime(convertToMinutes(currentObj.endTime)).split(":");
					// currEndObj = new Date(currentObj.endDate+" "+currentObj.endTime);
					currEndObj = new Date(parseInt(endDateArry[0]),parseInt(endDateArry[1])-1,parseInt(endDateArry[2]),parseInt(endTimeArry[0]),parseInt(endTimeArry[1]));
				}

				var currStTime = convertToMinutes(currentObj.startTime); 
				var currEdTime = convertToMinutes(currentObj.endTime); 
				var dropableEvent1 = dateList.filter(function (el) {
					return  (
		                        (
		                            currStTime <= convertToMinutes(el.startTime) && 
		                            currEdTime >= convertToMinutes(el.endTime)
		                        ) ||
		                        (
		                            convertToMinutes(el.startTime) <= currStTime && 
		                            convertToMinutes(el.endTime) >= currEdTime
		                        ) ||
		                        (
		                            currEdTime > convertToMinutes(el.startTime) &&
		                            convertToMinutes(el.endTime) > currStTime 
		                        )
		                    )
				});
				if(dropableEvent1.length){
					var dropableEvent2 = [];
					if(currEndObj == ""){
						for(var r=0;r<dropableEvent1.length;r++){
							var el = dropableEvent1[r];
							var elDateArry = moment(el.startDate).format("YYYY-MM-DD").split("-");
                    		var elTimeArry = convertMinsNumToTime(convertToMinutes(el.startTime)).split(":");
							var elStartObj = new Date(parseInt(elDateArry[0]),parseInt(elDateArry[1])-1,parseInt(elDateArry[2]),parseInt(elTimeArry[0]),parseInt(elTimeArry[1]));
							elEndObj = "";
							if(el.endDate == ""){
								dropableEvent2.push(el);
							}else{
								if ((new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime() >=
										new Date(moment(el.startDate).format("YYYY-MM-DD")).getTime() &&
										new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime() <=
										new Date(moment(el.endDate).format("YYYY-MM-DD")).getTime())
                                    ||
                                    (new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime()) <=
                                        new Date(moment(el.startDate).format("YYYY-MM-DD")).getTime() &&
                                        new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime() <=
                                        new Date(moment(el.endDate).format("YYYY-MM-DD")).getTime()
                                    ) {
                                    dropableEvent2.push(el);
                                }
							}
						}
					}else {
						for(var r=0;r<dropableEvent1.length;r++){
							var el = dropableEvent1[r];
							var elDateArry = moment(el.startDate).format("YYYY-MM-DD").split("-");
                    		var elTimeArry = convertMinsNumToTime(convertToMinutes(el.startTime)).split(":");
							var elStartObj = new Date(parseInt(elDateArry[0]),parseInt(elDateArry[1])-1,parseInt(elDateArry[2]),parseInt(elTimeArry[0]),parseInt(elTimeArry[1]));
							elEndObj = "";
                            if (el.endDate == "" && (new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime() >= new Date(moment(el.startDate).format("YYYY-MM-DD")).getTime())) {
								dropableEvent2.push(el);
							}else{
								if (new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime() >=
										new Date(moment(el.startDate).format("YYYY-MM-DD")).getTime() &&
										new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime() <=
										new Date(moment(el.endDate).format("YYYY-MM-DD")).getTime()
                                    ||
                                    (new Date(moment(currentObj.endDate).format("YYYY-MM-DD")).getTime() >=
                                        new Date(moment(el.startDate).format("YYYY-MM-DD")).getTime() &&
                                        new Date(moment(currentObj.endDate).format("YYYY-MM-DD")).getTime() <=
                                        new Date(moment(el.endDate).format("YYYY-MM-DD")).getTime()
                                    )
                                    ||
                                    (new Date(moment(currentObj.startDate).format("YYYY-MM-DD")).getTime()) <=
                                        new Date(moment(el.startDate).format("YYYY-MM-DD")).getTime() &&
                                        new Date(moment(currentObj.endDate).format("YYYY-MM-DD")).getTime() >=
                                        new Date(moment(el.endDate).format("YYYY-MM-DD")).getTime()
                                    ) {
                                    dropableEvent2.push(el);
                                }
							}
						}
					}
					if(dropableEvent2.length){
		            	allow = true; 
		        	}
				}
			}
		}
		return allow;
	}

	function populateErrorField(errorArry){
		if(errorArry.length){
			errorArry.forEach(function(element) {
			    $(element).css("border", "2px solid red");
			    if ($(element).hasClass("emptyPicker")) {
			        $(element).attr("title", "Date is empty");
			        $(element).attr("data-original-title", "Date is empty");
			    } else if ($(element).hasClass("invalidDate")) {
			        $(element).attr("title", "Invalid Date");
			        $(element).attr("data-original-title","Invalid Date");
			    } else {
			        $(element).attr("title", "Overlapping Date");
			        $(element).attr("data-original-title", "Overlapping Date");
			    }
			    $(element).tooltip({
			        tooltipClass: "custom-conflict",
		            track: true,
		        });
			});
		}
	}

	function convertToMinutes(timeString) {
        if (timeString != undefined) {
            if (timeString.split(' ')[1] == 'AM') {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                var minutes = parseInt(moment(timeString, 'h:mm A').format('mm'));
                return (hours * 60) + minutes;
            }
            else {
                var hours = parseInt(moment(timeString, 'h:mm A').format('h'));
                hours = hours != 12 ? hours + 12 : hours;
                var minutes = parseInt(moment(timeString, 'h:mm A').format('mm'));
                return (hours * 60) + minutes;
            }
        }
    }




    function getDayValue(date) {
        if (date != undefined) {
            switch (moment(date).format('dddd').toLowerCase()) {
                case 'monday':
                    return 1;
                    break;
                case 'tuesday':
                    return 2;
                    break;
                case 'wednesday':
                    return 3;
                    break;
                case 'thursday':
                    return 4;
                    break;
                case 'friday':
                    return 5;
                    break;
                case 'saturday':
                    return 6;
                    break;
                case 'sunday':
                    return 7;
                    break;
            }
        }
    }

    function populateTimings(date,dayCode,index,setValue){
    	var day = dayArray.filter(function(x){return x.dayCode == dayCode});
    	var timingArry =[], timeHTML = [],ConvertedTimingArry = [];
    	for (var i = 0; i < timingsData.length; i++) {
		  	if(day[0].dayId == timingsData[i]['hub_days']){
		    	for(var j= timingsData[i]['hub_starttime']; j < timingsData[i]['hub_endtime']; j = j+enrollmentObject.duration){
		      		timingArry.push(j);
		    	}
		  	}
		}
		if(timingArry.length){
		  	timingArry.sort(function(a, b){return a-b});
		  	for(var i=0; i< timingArry.length; i++){
		    	ConvertedTimingArry.push(tConvert(convertMinsNumToTime(timingArry[i])));
		  	}
		}
		if(ConvertedTimingArry.length){
		    for (var i = 0; i < ConvertedTimingArry.length; i++) {
		        if (!i && setValue) {
		            $("#"+dayCode+"-start-timepicker-"+index+"-btn").text(ConvertedTimingArry[i]);
		            $("#"+dayCode+"-start-timepicker-"+index+"-btn").val(ConvertedTimingArry[i]);
		            var startTime = ConvertedTimingArry[i];
		            var endTime = tConvert(convertMinsNumToTime(convertToMinutes(startTime) + enrollmentObject.duration));
	           		$("#end-time-"+dayCode+"-"+index).val(endTime);
	            	$("#end-time-"+dayCode+"-"+index).text(endTime);
	        	}
		        timeHTML.push('<li><a tabindex="-1" value-id="' + ConvertedTimingArry[i] + '" href="javascript:void(0)">' + ConvertedTimingArry[i] + '</a></li>');
		    }
		    $("#"+dayCode+"-start-timepicker-"+index+" ul").html(timeHTML);
		    $("#"+dayCode+"-start-timepicker-"+index+" .dropdown-menu").on('click', 'li a', function () {
		      if ($("#"+dayCode+"-start-timepicker-"+index+"-btn").val() != $(this).attr('value-id')) {
		      	  $(this).parents(".picker").prev().find(".hasDatepicker").removeAttr('style');
		      	  $(this).parents(".picker").prev().prev().find(".hasDatepicker").removeAttr('style');
		      	  $(this).parents(".picker").prev().find(".hasDatepicker").removeAttr('data-original-title');
		      	  $(this).parents(".picker").prev().prev().find(".hasDatepicker").removeAttr('data-original-title');
		      	  var originalParent = $(this).parents('.timing-dropdown')[0].id;
		      	  var parentIndex = originalParent.split('-')[3];
		      	  if (index != parentIndex) {
		      	      index = parentIndex;
		      	  }
		      	  $("#" + dayCode + "-start-timepicker-" + index + "-btn").text($(this).text());
		          $("#"+dayCode+"-start-timepicker-"+index+"-btn").val($(this).attr('value-id'));
		          var startTime = $("#"+dayCode+"-start-timepicker-"+index+"-btn").val();
		          var endTime = tConvert(convertMinsNumToTime(convertToMinutes(startTime) + enrollmentObject.duration));
		          $("#end-time-"+dayCode+"-"+index).val(endTime);
		          $("#end-time-"+dayCode+"-"+index).text(endTime);
		      }
		    });
		}
    }

	function DisableSpecificDates(date) {
	    var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
	    return [disableddates.indexOf(string) == -1];
	}

	function getQueryParm(){
        var query = decodeURIComponent(window.location.search).replace("?Data=", "");
        var result = {};
        if (typeof query == "undefined" || query == null) {
            return result;
        }
        var queryparts = query.split("&");
        for (var i = 0; i < queryparts.length; i++) {
            var params = queryparts[i].split("=");
            result[params[0]] = params.length > 1 ? params[1] : null;
        }
        return result;
    }

	function prompt(message,title) {
        $("#dialog > .dialog-msg").text(message);
        $("#dialog").dialog({
        	title: title,
            resizable: false,
            height: "auto",
            width: 350,
            modal: true,
            show: {
                effect: 'slide',
                complete: function() {
                    $(".loading").hide();
                }
            },
            buttons: {
                Close: function () {
                	if(title == 'Success'){
                		window.close();
                	}
                    $(this).dialog("close");
                }
            },
            close: function( event, ui ) {
            	if(title == 'Success'){
            		window.close();
            	}
            }
        });
    }

	$(".picker .hasDatepicker").attr("readonly", "readonly");

})();
