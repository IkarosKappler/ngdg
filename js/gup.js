// Get the URI GET params as an assoc.
// 
// A nicer version with regex
// Found at
//    https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
function gup() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
					     function(m,key,value) {
						 vars[key] = value;
					     });
    return vars;
}
