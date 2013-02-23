//-------
// convert calendar to Julian date
// (Julian day number algorithm adopted from Press et al.)
//-------
function cal_to_jd( era, y, m, d, h, mn, s )
{
	var jy, ja, jm;			//scratch

	if( y == 0 ) {
		alert("There is no year 0 in the Julian system!");
        return "invalid";
    }
    if( y == 1582 && m == 10 && d > 4 && d < 15 ) {
		alert("The dates 5 through 14 October, 1582, do not exist in the Gregorian system!");
        return "invalid";
    }

//	if( y < 0 )  ++y;
    if( era == "BCE" ) y = -y + 1;
	if( m > 2 ) {
		jy = y;
		jm = m + 1;
	} else {
		jy = y - 1;
		jm = m + 13;
	}

	var intgr = Math.floor( Math.floor(365.25*jy) + Math.floor(30.6001*jm) + d + 1720995 );

	//check for switch to Gregorian calendar
    var gregcal = 15 + 31*( 10 + 12*1582 );
	if( d + 31*(m + 12*y) >= gregcal ) {
		ja = Math.floor(0.01*jy);
		intgr += 2 - ja + Math.floor(0.25*ja);
	}

	//correct for half-day offset
	var dayfrac = h/24.0 - 0.5;
	if( dayfrac < 0.0 ) {
		dayfrac += 1.0;
		--intgr;
	}

	//now set the fraction of a day
	var frac = dayfrac + (mn + s/60.0)/60.0/24.0;

    //round to nearest second
    var jd0 = (intgr + frac)*100000;
    var jd  = Math.floor(jd0);
    if( jd0 - jd > 0.5 ) ++jd;
    return jd/100000;
}

//-------
// convert Julian date to calendar date
// (algorithm adopted from Press et al.)
//-------
function julianToGregorian(jd)
{
	var	j1, j2, j3, j4, j5;			//scratch

	//
	// get the date from the Julian day number
	//
    var intgr   = Math.floor(jd);
    var frac    = jd - intgr;
    var gregjd  = 2299161;
	if( intgr >= gregjd ) {				//Gregorian calendar correction
		var tmp = Math.floor( ( (intgr - 1867216) - 0.25 ) / 36524.25 );
		j1 = intgr + 1 + tmp - Math.floor(0.25*tmp);
	} else {
		j1 = intgr;
    }
    //correction for half day offset
    var dayfrac = frac + 0.5;
    if( dayfrac >= 1.0 ) {
        dayfrac -= 1.0;
        ++j1;
    }

    j2 = j1 + 1524;
    j3 = Math.floor( 6680.0 + ( (j2 - 2439870) - 122.1 )/365.25 );
    j4 = Math.floor(j3*365.25);
    j5 = Math.floor( (j2 - j4)/30.6001 );

    var d = Math.floor(j2 - j4 - Math.floor(j5*30.6001));
    var m = Math.floor(j5 - 1);
    if( m > 12 ) m -= 12;
    var y = Math.floor(j3 - 4715);
    if( m > 2 )   --y;
    if( y <= 0 )  --y;

    //
    // get time of day from day fraction
    //
    var hr  = Math.floor(dayfrac * 24.0);
    var mn  = Math.floor((dayfrac*24.0 - hr)*60.0);
    f  = ((dayfrac*24.0 - hr)*60.0 - mn)*60.0;
    var sc  = Math.floor(f);
    f -= sc;
    if( f > 0.5 ) ++sc;

    //form.year.value          = y;
    //form.month[m-1].selected = true;
    //form.day[d-1].selected   = d;
    //form.hour.value          = hr;
    //form.minute.value        = mn;
    //form.second.value        = sc;
    
    var dateObj = new Object();
    dateObj.month = m;
    dateObj.day = d;
    
    if( y < 0 ) {
     	y = -y;
     	dateObj.era = "BC";
    } else {
        dateObj.era = "AD";
    }
    
    dateObj.year = y;
    
    return dateObj;
}

//-------
// calculate Julian date from calendar date or calendar date from Julian date
//-------
function JDcalc( form ) {
    var era;
    for( k=0; k < form.era.length; ++k ) {
        if( form.era[k].checked ) {
            era = form.era[k].value;
            break;
        }
    }
    var calctype;
    for( k=0; k < form.calctype.length; ++k ) {
        if( form.calctype[k].checked ) {
            calctype = form.calctype[k].value;
            break;
        }
    }
    if( calctype == "JD" ) {
        var m;
        for( var k=0; k < form.month.length; ++k ) {    //Netscape 4.7 is stoopid
            if( form.month[k].selected ) {
                m = k+1;
                break;
            }
        }
        var d;
        for( var k=1; k <= form.day.length; ++k ) {    //Netscape 4.7 is stoopid
            if( form.day[k-1].selected ) {
                d = k;
                break;
            }
        }
        var y  = parseFloat(form.year.value);
//      var m  = parseFloat(form.month.value);
//      var d  = parseFloat(form.day.value);
        var h  = parseFloat(form.hour.value);
        var mn = parseFloat(form.minute.value);
        var s  = parseFloat(form.second.value);
        if( y < 0 ) {
	    	y   = -y;
            era = "BCE";
            form.year.value = y;
            form.era[1].checked = true;
        }
        form.JDedit.value = cal_to_jd(era,y,m,d,h,mn,s);
    } else {
        jd_to_cal(form.JDedit.value,form);
    }
    //weekday
    var	weekday = new Array("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday");
    var t  = parseFloat(form.JDedit.value) + 0.5;
    var wd = Math.floor( (t/7 - Math.floor(t/7))*7 + 0.000000000317 );   //add 0.01 sec for truncation error correction
    form.wkday.value = weekday[wd];
}

var	month = new Array("January","February","March","April","May","June","July",
					  "August","September","October","November","December");
var numdays = new Array(31,28,31,30,31,30,31,31,30,31,30,31);

function ModifiedDate() {
	updated = new Date(document.lastModified);
	Month   = month[updated.getMonth()];
	Day     = updated.getDate();
	Year    = updated.getYear();
	Hour    = updated.getHours();
	Min     = updated.getMinutes();
    if( Year < 2000 ) Year += 1900;
    if( Year < 2000 ) Year += 100;  //Netscape 3 and IE 4.7 return 0 instead of 100 for 2000
	if( Hour < 10 )  Hour = "0" + Hour;
	if( Min  < 10 )  Min  = "0" + Min;
	document.write("Last modified " + Month + " " + Day +  ", " + Year + " at " + Hour + ":" + Min);
}

function set_form_fields(form) {

    //grab the current USNO clock time
    var today = new Date();

    var year = today.getYear();
    if( year < 2000 ) year += 1900;
    if( year < 2000 ) year += 100;  //Netscape 3 and IE 4.7 return 0 instead of 100 for 2000
    var month = today.getMonth();
    var day   = today.getDate();
    var hour  = today.getHours();
    var mins  = today.getMinutes();
    var secs  = today.getSeconds();

    //convert to UT
    var TZ = today.getTimezoneOffset()/60;
    hour += TZ;
    if( hour >= 24 ) {
        hour -= 24;
        ++day;
        if( day > numdays[month-1] ) {
            day = 1;
            ++month;
            if( month > 11 ) {
                month -= 12;
                ++year;
            }
        }
    }

    //set the form fields
    form.year.value = year;
    for( k=0; k < form.month.length; ++k ) {    //Netscape 4.7 is stoopid
        if( k == month ) {
            form.month[k].selected = true;
            break;
        }
    }
    form.day.value = day;
    for( k=1; k <= form.day.length; ++k ) {    //Netscape 4.7 is stoopid
        if( k == day ) {
            form.day[k-1].selected = true;
            break;
        }
    }
    form.hour.value   = hour;
    form.minute.value = mins;
    form.second.value = secs;

    doJD(form);
}

function dodate(form) {
    for( k=0; k < form.calctype.length; ++k ) {
        if( form.calctype[k].value == "date" ) {
            form.calctype[k].checked = true;
            break;
        }
    }
}

function doJD(form) {
    for( k=0; k < form.calctype.length; ++k ) {
        if( form.calctype[k].value == "JD" ) {
            form.calctype[k].checked = true;
            break;
        }
    }
}
